# Palverse API

Palverse is a bilingual Palestinian business directory platform. This is the main API service built with Laravel 11.

## Architecture & Tech Stack

- **Framework**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Bearer Token)
- **Primary Keys**: Internal numeric IDs, external ULIDs (`public_id`)
- **Languages**: Arabic (RTL) & English (LTR)

## Documentation

The API endpoints, schemas, and operational commands are fully documented:

- **[API Documentation Index](docs/README.md)**: Explore the OpenAPI spec, Postman collection, and operations guides.
- **[OpenAPI Spec](docs/openapi/palverse-api-v1.yaml)**: OpenAPI 3.1 definitions for the 145+ V1 API routes.
- **[Postman Collection](docs/postman/palverse-api-v1.json)**: Ready-to-import Postman collection.
- **[CLI Commands](docs/operations/commands.md)**: Documentation for custom artisan commands.

For higher-level business rules and architecture decisions, see the `/documentation` directory at the project root.

## Local Setup

1. Copy `.env.example` to `.env` and configure your database.
2. Install PHP dependencies: `composer install`.
3. Generate the application key: `php artisan key:generate`.
4. Run migrations and seeders: `php artisan migrate --seed`.
5. Start the local server: `php artisan serve`.
6. Import the Postman environment and collection in `docs/postman` to start testing the endpoints.

## Testing

Run the feature test suite:
```bash
php artisan test
```
The test suite heavily utilizes `RefreshDatabase` and covers Authentication, Merchant Operations, Public Lookups, Admin Controls, Notifications, and specific Edge-cases (like Security Headers and Auditing).
