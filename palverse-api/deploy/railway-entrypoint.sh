#!/usr/bin/env bash
set -euo pipefail

cd /app

echo "[railway] Waiting for database..."
php -r '
$host = getenv("DB_HOST") ?: "127.0.0.1";
$port = getenv("DB_PORT") ?: "3306";
$user = getenv("DB_USERNAME") ?: "root";
$pass = getenv("DB_PASSWORD") ?: "";
$db   = getenv("DB_DATABASE") ?: "palverse";
$deadline = time() + 90;
do {
    try {
        new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        echo "Database is ready\n";
        exit(0);
    } catch (Throwable $e) {
        fwrite(STDERR, "DB not ready: ".$e->getMessage()."\n");
        sleep(2);
    }
} while (time() < $deadline);
fwrite(STDERR, "Database connection timed out\n");
exit(1);
'

if [ -z "${APP_KEY:-}" ]; then
  echo "[railway] APP_KEY missing — generating ephemeral key (set a stable APP_KEY in Railway Variables)."
  export APP_KEY="$(php artisan key:generate --show --no-ansi)"
fi

php artisan config:clear
php artisan migrate --force
php artisan storage:link || true

if [ "${PALVERSE_SEED_DEMO_ON_BOOT:-false}" = "true" ]; then
  echo "[railway] Seeding demo data (Hebron)..."
  export PALVERSE_ALLOW_DEMO_SEEDING=true
  php artisan palverse:seed-demo --force
  echo "[railway] Demo seed finished. Set PALVERSE_SEED_DEMO_ON_BOOT=false after first boot."
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache || true

PORT="${PORT:-8000}"
echo "[railway] Starting API on 0.0.0.0:${PORT}"
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
