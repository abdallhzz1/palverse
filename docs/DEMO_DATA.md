# Palverse Demo Data Guide

This document defines the standard demo accounts provisioned by the `PalverseDemoSeeder` for use during local development, staging tests, and QA workflows.

## Environment Provisioning
To provision these accounts, run the following command in the API root:
```bash
php artisan palverse:seed-demo
```
This command is highly idempotent. Running it multiple times will not duplicate existing database state.

## Core Accounts

| Role | Email | Password | Primary Interface | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@palverse.demo` | `DemoAdmin123!` | `palverse-admin` (`:3001`) | Total platform management |
| **Merchant** | `merchant1@palverse.demo` | `DemoMerchant123!` | `palverse-web` (`/merchant`) | Managing own stores and offers |
| **Representative** | `representative1@palverse.demo` | `DemoRepresentative123!` | `palverse-web` (`/representative`) | Creating store requests |
| **Follow-up** | `followup1@palverse.demo` | `DemoFollowUp123!` | `palverse-web` (`/follow-up`) | Reviewing requests, managing calls |

*Note: The explicit `customer` role has been deprecated. Public visitors browse the platform without authentication credentials.*
