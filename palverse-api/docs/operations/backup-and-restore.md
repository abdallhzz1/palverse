# Palverse Backup and Restore Strategy

## 1. Database Backup
Databases should be backed up regularly (e.g., daily) and retained for an appropriate period based on business requirements.

### MySQL Backup Example
Use `mysqldump` to create a logical backup of the database.
**Note:** Do not type passwords directly in the CLI. Use a `.my.cnf` configuration file or environment variables.

```bash
# Example backup command (assuming credentials in ~/.my.cnf)
mysqldump palverse_prod > /path/to/backups/palverse_db_$(date +%F).sql

# Compress the backup to save space
gzip /path/to/backups/palverse_db_$(date +%F).sql
```

## 2. Media Backup
If using local storage (`storage/app/public`), the directories must be backed up securely.
If using S3, ensure bucket versioning and automated AWS snapshots are enabled.

```bash
# Example local media backup using rsync
rsync -a /var/www/palverse/storage/app/public /path/to/backups/media_$(date +%F)
```

## 3. Storage and Retention
- **Offsite Copies**: Backups must be securely transferred offsite (e.g., AWS S3, Glacier, or a separate backup server).
- **DO NOT** store backups within the web root (`public/`).
- **DO NOT** commit backup files to version control.
- **Encryption**: Encrypt backup files at rest if they contain sensitive PII.

## 4. Restore Strategy
Restoring should be practiced periodically to ensure RPO (Recovery Point Objective) and RTO (Recovery Time Objective) targets can be met.

### Database Restore Example
```bash
# Decompress
gunzip palverse_db_2026-01-01.sql.gz

# Restore
mysql palverse_prod < palverse_db_2026-01-01.sql
```

After a restore:
- Verify data integrity.
- Clear application caches (`php artisan optimize:clear`).
- Restart queues (`php artisan queue:restart`).
