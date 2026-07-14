# Palverse API CLI Commands

This document details the custom artisan CLI commands available in the Palverse API.

## Subscriptions

### 1. Expire Store Subscriptions

**Command:**
```bash
php artisan subscriptions:expire
```

**Description:**
Scans for all active store subscriptions where the `ends_at` date has passed and marks their status as expired.

**Usage:**
Run this command periodically (e.g., daily or hourly) via the Laravel Scheduler to ensure that expired subscriptions are properly invalidated.

---

### 2. Notify Expiring Subscriptions

**Command:**
```bash
php artisan subscriptions:notify-expiring {--days=7}
```

**Description:**
Notifies store owners when their active subscription is approaching its expiration date.

**Options:**
- `--days=N`: The number of days before expiration to send the notification (default: 7). The command will look for subscriptions expiring on or before `now() + N days`.

**Usage:**
```bash
# Notify for subscriptions expiring in the next 7 days
php artisan subscriptions:notify-expiring

# Notify for subscriptions expiring in the next 3 days
php artisan subscriptions:notify-expiring --days=3
```
Run this command daily via the Laravel Scheduler to proactively alert merchants.
