# Palverse Deployment Checklist

This document details the deployment process for Palverse API in a production environment.

## Before deployment
- [ ] Backup database
- [ ] Backup media storage (if using local storage, otherwise verify S3 snapshot)
- [ ] Verify `.env` matches `.env.production.example` parameters
- [ ] Verify `APP_DEBUG=false`
- [ ] Verify `APP_KEY` is set and secure
- [ ] Verify CORS settings (`PALVERSE_ALLOWED_ORIGINS` has no wildcards)
- [ ] Verify Mail credentials
- [ ] Verify Queue connection (Redis recommended)
- [ ] Verify Cache connection (Redis recommended)
- [ ] Verify Storage settings (S3 recommended)
- [ ] Verify HTTPS is enabled on the load balancer/web server
- [ ] Verify DNS records for API and Frontend
- [ ] Verify Frontend URLs (`PALVERSE_PUBLIC_WEB_URL`, etc.)
- [ ] Review `composer audit` for vulnerabilities
- [ ] Run full test suite locally: `php artisan test`

## Deployment
1. Transfer code to the production server.
2. Ensure you are in the project root: `cd /var/www/palverse`
3. Execute the deployment script: `./deploy/deploy.sh`
   - This script will safely put the app in maintenance mode, install dependencies, run migrations, rebuild caches, link storage, and restart the queue.
4. Verify the Laravel Scheduler is running via cron.

## After deployment
- [ ] Check API Health: `curl -X GET https://api.palverse.example.com/api/v1/health`
- [ ] Check API Readiness: `curl -X GET https://api.palverse.example.com/api/v1/ready`
- [ ] Test admin login
- [ ] Test public store discovery
- [ ] Test image upload
- [ ] Test email delivery (e.g. password reset)
- [ ] Check queue worker status (`supervisorctl status palverse-worker:*`)
- [ ] Verify audit log entries are recorded
- [ ] Check Laravel error logs (`storage/logs/laravel.log`) for unexpected errors

## Rollback
If a critical failure occurs post-deployment:
1. **Code Rollback**: Revert to the previous stable release tag via Git or your deployment tool.
2. **Database Rollback**:
   - If migrations were strictly additive (recommended), code rollback is usually sufficient.
   - If destructive schema changes occurred, **DO NOT** use `migrate:rollback`. Instead, restore from the database backup taken prior to deployment.
3. **Restore Backup**: Use `mysql < backup.sql` (see Backup & Restore documentation).
4. **Worker Restart**: Run `php artisan queue:restart`.
5. **Cache Clear**: Run `php artisan optimize:clear`.
