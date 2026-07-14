# Palverse Production Monitoring

Monitoring ensures system reliability and performance. Below are the key metrics and components to monitor in the Palverse production environment.

## 1. Endpoints & Liveness
- **Health Check (`/api/v1/health`)**: Monitor for HTTP 200. This is a lightweight liveness probe.
- **Readiness Check (`/api/v1/ready`)**: Monitor for HTTP 200. This checks database, cache, and storage connectivity. Returns HTTP 503 if a dependency is down.
- **HTTP 5xx Rate**: Alert if server errors exceed a defined threshold (e.g., >1% of requests).
- **Response Latency**: Monitor average and 95th percentile response times for public discovery APIs.

## 2. Queue Health
Queue workers process asynchronous jobs (like emails). A delayed queue can impact user experience.
- **Queue Depth**: Alert if the pending job count on the `mail` or `default` queues exceeds a healthy limit.
- **Failed Jobs**: Monitor the `failed_jobs` table. Alert on new entries.
  - Check with: `php artisan queue:failed`

## 3. Infrastructure & Dependencies
- **Database Availability**: Monitored via the readiness endpoint and infrastructure metrics (CPU, Memory, Connections).
- **Cache Availability**: Monitored via the readiness endpoint. Ensure Redis memory is not exhausted.
- **Storage**: Monitor disk usage for local storage, or S3 availability and permissions.
- **Server Metrics**: Monitor CPU, RAM, and Disk Space on API and Worker servers.

## 4. Application Metrics
- **Scheduler Success**: Ensure cron executes properly. Log output should be reviewed for failing scheduled commands (`subscriptions:expire`).
- **Log Growth**: Monitor `storage/logs/laravel.log`. Rapid growth indicates an application anomaly.
- **Authentication Abuse**: Monitor the rate limit headers. Watch for brute-force attempts on `/api/v1/auth/login`.

*(Note: Palverse MVP does not integrate a vendor-specific monitoring tool, but these metrics can be ingested by Datadog, New Relic, Prometheus, or AWS CloudWatch.)*
