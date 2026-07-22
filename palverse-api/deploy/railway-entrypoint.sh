#!/usr/bin/env bash
set -euo pipefail

cd /app

echo "[railway] Boot starting (pwd=$(pwd), PORT=${PORT:-8000})"

# Prefer live Railway env vars over any baked .env inside the image.
if [ -f .env ]; then
  echo "[railway] Removing image .env so Railway Variables take effect"
  rm -f .env
fi

# Railway MySQL plugin often exposes MYSQL* — map into Laravel DB_*.
export DB_CONNECTION="${DB_CONNECTION:-mysql}"
export DB_HOST="${DB_HOST:-${MYSQLHOST:-${MYSQL_HOST:-}}}"
export DB_PORT="${DB_PORT:-${MYSQLPORT:-${MYSQL_PORT:-3306}}}"
export DB_DATABASE="${DB_DATABASE:-${MYSQLDATABASE:-${MYSQL_DATABASE:-railway}}}"
export DB_USERNAME="${DB_USERNAME:-${MYSQLUSER:-${MYSQL_USER:-}}}"
export DB_PASSWORD="${DB_PASSWORD:-${MYSQLPASSWORD:-${MYSQL_PASSWORD:-}}}"

# Free-tier friendly defaults (avoid DB-backed cache before migrate).
export CACHE_STORE="${CACHE_STORE:-file}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"
export QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"
export FILESYSTEM_DISK="${FILESYSTEM_DISK:-public}"
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"

if [ -n "${MYSQL_URL:-${DATABASE_URL:-}}" ]; then
  export DB_URL="${DB_URL:-${MYSQL_URL:-${DATABASE_URL}}}"
  echo "[railway] Using DB_URL from MYSQL_URL/DATABASE_URL"
fi

echo "[railway] DB_HOST=${DB_HOST:-<empty>} DB_PORT=${DB_PORT} DB_DATABASE=${DB_DATABASE:-<empty>} DB_USERNAME=${DB_USERNAME:-<empty>} CACHE_STORE=${CACHE_STORE}"

if [ -z "${APP_KEY:-}" ]; then
  echo "[railway] APP_KEY missing — generating ephemeral key."
  export APP_KEY="base64:$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
fi

php artisan config:clear || true
php artisan cache:clear || true
rm -f bootstrap/cache/config.php bootstrap/cache/routes-v7.php bootstrap/cache/routes.php 2>/dev/null || true

if [ -z "${DB_HOST}" ] || [ -z "${DB_DATABASE}" ] || [ -z "${DB_USERNAME}" ]; then
  echo "[railway] ERROR: DB vars still empty after mapping."
  echo "[railway] In Railway Variables add DB_HOST as Reference to MySQL → MYSQLHOST (and DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD)."
else
  echo "[railway] Waiting for database..."
  if php -r '
$host = getenv("DB_HOST");
$port = getenv("DB_PORT") ?: "3306";
$user = getenv("DB_USERNAME");
$pass = getenv("DB_PASSWORD") ?: "";
$db   = getenv("DB_DATABASE");
$deadline = time() + 90;
$last = "";
do {
    try {
        new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        fwrite(STDOUT, "Database is ready\n");
        exit(0);
    } catch (Throwable $e) {
        $last = $e->getMessage();
        fwrite(STDERR, "DB not ready: ".$last."\n");
        sleep(2);
    }
} while (time() < $deadline);
fwrite(STDERR, "Database connection timed out: {$last}\n");
exit(1);
'; then
    php artisan migrate --force --no-interaction || echo "[railway] WARNING: migrate failed"
    php artisan storage:link || true

    if [ "${PALVERSE_SEED_DEMO_ON_BOOT:-false}" = "true" ]; then
      echo "[railway] Seeding demo data..."
      export PALVERSE_ALLOW_DEMO_SEEDING=true
      php artisan palverse:seed-demo --force || echo "[railway] WARNING: demo seed failed"
    fi
  else
    echo "[railway] WARNING: could not connect to MySQL — check DB_* References and that MySQL service is running."
  fi
fi

PORT="${PORT:-8000}"
echo "[railway] Starting API on 0.0.0.0:${PORT}"
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
