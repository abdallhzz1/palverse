#!/usr/bin/env bash
set -euo pipefail

cd /app

# Railway MySQL plugin often exposes MYSQL* — map into Laravel DB_* if missing.
export DB_CONNECTION="${DB_CONNECTION:-mysql}"
export DB_HOST="${DB_HOST:-${MYSQLHOST:-${MYSQL_HOST:-}}}"
export DB_PORT="${DB_PORT:-${MYSQLPORT:-${MYSQL_PORT:-3306}}}"
export DB_DATABASE="${DB_DATABASE:-${MYSQLDATABASE:-${MYSQL_DATABASE:-}}}"
export DB_USERNAME="${DB_USERNAME:-${MYSQLUSER:-${MYSQL_USER:-}}}"
export DB_PASSWORD="${DB_PASSWORD:-${MYSQLPASSWORD:-${MYSQL_PASSWORD:-}}}"

if [ -z "${DB_HOST}" ] || [ -z "${DB_DATABASE}" ] || [ -z "${DB_USERNAME}" ]; then
  echo "[railway] ERROR: Database env vars are missing."
  echo "[railway] Set DB_HOST/DB_DATABASE/DB_USERNAME/DB_PASSWORD"
  echo "[railway] or link the MySQL service and reference MYSQLHOST/MYSQLDATABASE/MYSQLUSER/MYSQLPASSWORD."
  echo "[railway] Current: DB_HOST='${DB_HOST:-}' DB_DATABASE='${DB_DATABASE:-}' DB_USERNAME='${DB_USERNAME:-}'"
  exit 1
fi

echo "[railway] Waiting for database at ${DB_HOST}:${DB_PORT}/${DB_DATABASE} ..."
php -r '
$host = getenv("DB_HOST");
$port = getenv("DB_PORT") ?: "3306";
$user = getenv("DB_USERNAME");
$pass = getenv("DB_PASSWORD") ?: "";
$db   = getenv("DB_DATABASE");
$deadline = time() + 60;
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
'

if [ -z "${APP_KEY:-}" ]; then
  echo "[railway] APP_KEY missing — generating ephemeral key (set a stable APP_KEY in Railway Variables)."
  export APP_KEY="$(php artisan key:generate --show --no-ansi | tr -d '\r')"
fi

php artisan config:clear
php artisan migrate --force --no-interaction
php artisan storage:link || true

# Cache after migrate so session/cache tables exist when using database drivers.
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

PORT="${PORT:-8000}"
echo "[railway] Starting API on 0.0.0.0:${PORT}"

# Start HTTP server first so Railway healthchecks can pass, then optionally seed.
php artisan serve --host=0.0.0.0 --port="${PORT}" &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give the server a moment to bind.
sleep 2
if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "[railway] ERROR: PHP server exited early."
  wait "${SERVER_PID}" || true
  exit 1
fi

if [ "${PALVERSE_SEED_DEMO_ON_BOOT:-false}" = "true" ]; then
  echo "[railway] Seeding demo data (Hebron) in background..."
  export PALVERSE_ALLOW_DEMO_SEEDING=true
  php artisan palverse:seed-demo --force || echo "[railway] Demo seed failed (non-fatal). Check logs."
  echo "[railway] Demo seed finished. Set PALVERSE_SEED_DEMO_ON_BOOT=false after first boot."
fi

wait "${SERVER_PID}"
