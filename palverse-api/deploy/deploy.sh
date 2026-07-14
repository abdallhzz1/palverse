#!/bin/bash

# Safe deployment script for Palverse API
# Requires execution from the project root.
# Example: ./deploy/deploy.sh /var/www/palverse

set -euo pipefail

PROJECT_PATH="${1:-/var/www/palverse}"
cd "$PROJECT_PATH"

echo "Deploying Palverse API..."

# 1. Enable Maintenance Mode
echo "Entering maintenance mode..."
php artisan down || true

# 2. Pull / Release Code (Placeholder)
echo "Pulling latest code... (Placeholder)"
# git pull origin main

# 3. Install Dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# 4. Run Migrations (Safe additive migrations only)
echo "Running migrations..."
php artisan migrate --force

# 5. Clear Caches
echo "Clearing optimization caches..."
php artisan optimize:clear

# 6. Rebuild Caches
echo "Building config, route, and event caches..."
php artisan config:cache
php artisan route:cache
php artisan event:cache

# 7. Create Storage Link (If missing)
echo "Ensuring storage link exists..."
php artisan storage:link

# 8. Restart Queues
echo "Restarting queue workers..."
php artisan queue:restart

# 9. Disable Maintenance Mode
echo "Exiting maintenance mode..."
php artisan up

echo "Deployment complete."
