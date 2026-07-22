# Palverse Demo Dataset

The demo dataset provides a robust, idempotent way to populate the Palverse database with fictional, Hebron-centric data for local development and UI testing.

## Overview

The dataset includes:
- **Hebron City** and 22 surrounding zones/localities.
- **12 Categories** covering core business sectors.
- **Accounts**:
  - 1 Admin (`admin@palverse.demo`)
  - 8 Merchants (e.g. `merchant1@palverse.demo`)
  - 6 Customers (e.g. `customer1@palverse.demo`)
- **18 Stores** distributed across Hebron zones (Approved, Pending, and Rejected).
- **Store Attributes**:
  - Auto-generated placeholder SVG images (Logo & Cover).
  - Realistic 6-day working hours.
  - Social media links (Facebook & Instagram).
- **3 Subscription Plans** (Basic, Professional, Premium).
- **Store Subscriptions** (Active, Expiring Soon, Expired, Cancelled states).
- **14 Offers** (Active, Expired, Future).
- **Platform Content**:
  - 8 System Settings (Branding & Contact Info).
  - 4 Static Pages (About, Privacy, Terms, Contact).
  - 12 FAQs.

## Usage

### 1. Enable Demo Seeding
In your `.env` file, ensure the following is set:
```env
PALVERSE_ALLOW_DEMO_SEEDING=true
PALVERSE_DEMO_ADMIN_PASSWORD=DemoAdmin123!
PALVERSE_DEMO_MERCHANT_PASSWORD=DemoMerchant123!
PALVERSE_DEMO_CUSTOMER_PASSWORD=DemoCustomer123!
```

### 2. Run the Seeder
Run the custom artisan command:
```bash
php artisan palverse:seed-demo
```
*Note: The command is safe to run multiple times. It uses `updateOrCreate` to prevent duplication.*

### 3. Production Protection
The seeder is hard-blocked from running in production (`APP_ENV=production`) unless both:
1. The `--force` flag is appended.
2. `PALVERSE_ALLOW_DEMO_SEEDING=true` is explicitly set in the production environment variables.

## Default Credentials

### Admin Dashboard (`http://localhost:3001`)
- **Email:** `admin@palverse.demo`
- **Password:** `DemoAdmin123!`

### Merchant Dashboard / App
- **Email:** `merchant[1-8]@palverse.demo`
- **Password:** `DemoMerchant123!`

### Customer App
- **Email:** `customer[1-6]@palverse.demo`
- **Password:** `DemoCustomer123!`

## Architecture

The orchestration is handled by `PalverseDemoSeeder`, which delegates to:
1. `DemoLocationSeeder`
2. `DemoCategorySeeder`
3. `DemoUserSeeder`
4. `DemoStoreSeeder`
5. `DemoSubscriptionSeeder`
6. `DemoOfferSeeder`
7. `DemoContentSeeder`

Idempotency is tested and enforced via `tests/Feature/EndToEnd/DemoSeederTest.php`.
