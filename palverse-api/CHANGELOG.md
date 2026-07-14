# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-14

### Added
- First stable release of the Palverse API v1.0.0.
- Authentication module (Sanctum, device management, session revocation).
- Roles and permissions enforcement.
- Merchant registration, email verification, and password recovery.
- Full merchant store management (working hours, social links, logo, cover, gallery).
- Offers management for merchants.
- Subscription plans and assignment workflow.
- Admin review and approval workflows for stores and users.
- Public search, category, city, and zone listing endpoints.
- In-app notification system (broadcast capable).
- System settings, FAQs, and static pages endpoints.
- Extensive cache layer for public reference data.
- Rate limiting and standard HTTP security headers.
- Health and readiness endpoints for deployment.
- Interactive `palverse:create-admin` CLI command.

### Security
- Passwords are securely hashed and never returned in API payloads.
- ULIDs (`public_id`) are used externally to prevent ID enumeration.
- Exception traces are suppressed when `APP_DEBUG=false`, returning standardized JSON errors.
- Uploaded media is strictly validated against image mimes (`jpeg`, `png`, `webp`, `jpg`) to prevent SVG XSS and arbitrary code execution.
- Configured secure session defaults.

### Operations
- Background jobs configured for queue workers (`palverse-worker.conf`).
- Scheduled tasks for subscription expiration and notifications configured.
- Deployment shell scripts (`deploy.sh`) created for safe zero-downtime updates.
- Documentation created for deployment, monitoring, and backups.

### Known Limitations
- No integration with external payment gateways yet.
- 2FA and Social Login are deferred to future releases.
- KYC processes are handled off-platform for now.
