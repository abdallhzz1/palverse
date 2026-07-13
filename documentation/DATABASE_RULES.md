# Palverse Database Rules

This document outlines the design standards, conventions, indexing rules, data integrity constraints, and transaction rules for the Palverse database schema.

---

## 1. Naming Conventions

*   **Database Tables**: All table names must be in `snake_case`, plural format (e.g., `users`, `stores`, `subscription_plans`). Pivot tables are named using singular alphabetical order (e.g., `model_has_roles`).
*   **Columns**: Column names must be in `snake_case`, singular format (e.g., `owner_id`, `name_ar`, `start_date`).
*   **Foreign Keys**: Standardized as `singular_table_name_id` matching the target primary key (e.g., `store_id` targets `stores.id`).

---

## 2. Key Strategies

*   **Internal Primary Keys**: All tables must use auto-incrementing unsigned integers (`id`) for internal primary keys to maximize join speeds and page clustering.
*   **Public Exposure (UUID/Slug)**: Auto-increment keys must never be exposed to public APIs or URLs. Public routing maps records using:
    *   `slug`: Unique strings for URL identifiers (e.g., `stores.slug`, `categories.slug`).
    *   `uuid`: Version 4 globally unique identifiers for accounts and entities (e.g., `users.uuid`, `offers.uuid`).

---

## 3. Localization Strategy

*   **Explicit Column Translation**: Translatable fields are designed as distinct columns mapping target languages (e.g., `name_ar` and `name_en`).
*   **Required Languages**: In the MVP, Arabic values are strictly required (`NOT NULL`), whereas English translations are optional (`NULL`).

---

## 4. Integrity and Deletion Rules

*   **Soft Deletion**: Applied on crucial business entities to avoid destructive actions (`deleted_at` timestamp). If `deleted_at` is not null, the row is treated as inactive:
    *   Affected tables: `users`, `stores`, `offers`.
*   **Cascading Rules**:
    *   `CASCADE ON DELETE`: Pivot tables and dependent child tables (e.g., `store_working_hours`, `store_media`, `store_social_links`) must use cascade-delete triggers when the parent store is purged from the database.
    *   `RESTRICT ON DELETE`: Important metadata records (e.g., categories, zones, subscription plans) must restrict deletion if active stores are linked to them.

---

## 5. Monetary and Date/Time Rules

*   **Monetary Precision**: Prices must use `decimal(10, 2)` format (e.g., `subscription_plans.price`). Float or double datatypes are strictly banned for pricing fields to prevent rounding errors.
*   **Currency Storage**: The platform operates in Palestinian local currency markets. In the MVP, all prices default to Israeli Shekel (ILS) and are formatted by the API.
*   **Time Zone Strategy**: Databases must store all timestamp fields in UTC time. The frontend applications convert UTC values back to local Palestine Time (`Asia/Gaza`, GMT+2 or GMT+3 daylight savings) when displaying timestamps to users.

---

## 6. Indexing & Query Optimization

*   **Foreign Keys**: All foreign key column columns must be indexed automatically or explicitly.
*   **Search Fields**: Fields frequently queried in searches or filtered results must be indexed:
    *   Indices are declared on `stores.name_ar`, `stores.name_en`, `stores.status`, `stores.is_active`, `offers.start_date`, and `offers.end_date`.
*   **Unique Constraints**: Standardized on fields requiring uniqueness logic (e.g., `users.email`, `stores.slug`, `categories.slug`).

---

## 7. Transactions and Security Boundaries

*   **Database Transactions**: Multi-table write actions (such as store approval inserting history logs, or subscription plan upgrades) must be executed inside a database transaction block (`DB::beginTransaction`). If any part of the query fails, changes are rolled back.
*   **Authentication Token Security**: Sanctum session hashes are stored in `personal_access_tokens` as hashed keys. Raw tokens are never stored inside database columns.
