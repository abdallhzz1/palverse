#!/usr/bin/env bash
set -euo pipefail

cd /app

echo "[railway] Boot starting (pwd=$(pwd), PORT=${PORT:-8000})"

# Railway MySQL plugin often exposes MYSQL* — map into Laravel DB_* if missing.
export DB_CONNECTION="${DB_CONNECTION:-mysql}"
export DB_HOST="${DB_HOST:-${MYSQLHOST:-${MYSQL_HOST:-}}}"
export DB_PORT="${DB_PORT:-${MYSQLPORT:-${MYSQL_PORT:-3306}}}"
export DB_DATABASE="${DB_DATABASE:-${MYSQLDATABASE:-${MYSQL_DATABASE:-}}}"
export DB_USERNAME="${DB_USERNAME:-${MYSQLUSER:-${MYSQL_USER:-}}}"
export DB_PASSWORD="${DB_PASSWORD:-${MYSQLPASSWORD:-${MYSQL_PASSWORD:-}}}"

echo "[railway] DB_HOST=${DB_HOST:-<empty>} DB_PORT=${DB_PORT} DB_DATABASE=${DB_DATABASE:-<empty>} DB_USERNAME=${DB_USERNAME:-<empty>}"

if [ -z "${APP_KEY:-}" ]; then
  echo "[railway] APP_KEY missing — generating ephemeral key."
  # key:generate needs a runnable app; create a temporary key without DB.
  export APP_KEY="base64:$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
fi

# Start HTTP immediately so Railway can reach /up even while DB/migrate runs.
PORT="${PORT:-8000}"
echo "[railway] Starting API on 0.0.0.0:${PORT}"
php artisan serve --host=0.0.0.0 --port="${PORT}" &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 2
if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "[railway] ERROR: PHP server exited early. Likely APP_KEY/bootstrap failure."
  php artisan about || true
  wait "${SERVER_PID}" || true
  exit 1
fi
echo "[railway] HTTP server is up (pid=${SERVER_PID})"

if [ -z "${DB_HOST}" ] || [ -z "${DB_DATABASE}" ] || [ -z "${DB_USERNAME}" ]; then
  echo "[railway] WARNING: DB vars missing — skipping migrate/seed. Link MySQL and set DB_* or MYSQL*."
  wait "${SERVER_PID}"
  exit 0
fi

echo "[railway] Waiting for database..."
php -r '
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
' || echo "[railway] WARNING: DB wait failed — API stays up without migrate."

php artisan config:clear || true
php artisan migrate --force --no-interaction || echo "[railway] WARNING: migrate failed"
php artisan storage:link || true

if [ "${PALVERSE_SEED_DEMO_ON_BOOT:-false}" = "true" ]; then
  echo "[railway] Seeding demo data..."
  export PALVERSE_ALLOW_DEMO_SEEDING=true
  php artisan palverse:seed-demo --force || echo "[railway] WARNING: demo seed failed"
fi

php artisan config:cache || true
php artisan route:cache || true

echo "[railway] Boot finished — waiting on server"
wait "${SERVER_PID}"
