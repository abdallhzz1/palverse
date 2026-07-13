# Palverse Database Dictionary

This document details the database dictionary for all tables in the Palverse Minimum Viable Product (MVP).

---

## 1. Table: `users`
*   **Purpose**: Stores authentication credentials, identity records, and role links for all platform users (Admins, Merchants, and Public users).
*   **Soft Delete Support**: Yes (`deleted_at`).
*   **Public Exposure Rule**: Public APIs resolve users via the `uuid` column. The integer `id`, `password`, and other sensitive tokens are never serialized or exposed.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `12` |
| `uuid` | `CHAR(36)` | Required | *None* | Unique Constraint | Yes | Valid UUID v4 | `f81d4fae-7dec-11d0-a765-00a0c91e6bf6` |
| `name` | `VARCHAR(191)` | Required | *None* | *None* | No | Max length 191 | `Ahmed Khalil` |
| `email` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | Valid unique email | `ahmed@palverse.ps` |
| `password` | `VARCHAR(255)` | Required | *None* | *None* | No | Hashed string | `$...` |
| `email_verified_at`| `TIMESTAMP` | Nullable | `NULL` | *None* | No | Valid timestamp | `2026-07-13 14:00:00` |
| `remember_token` | `VARCHAR(100)` | Nullable | `NULL` | *None* | No | Alphanumeric | `xyz123...` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | Auto generated | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | Auto updated | `2026-07-13 19:30:00` |
| `deleted_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | Yes | Soft delete mark | `NULL` |

---

## 2. Table: `roles`
*   **Purpose**: Manages system privilege definitions (e.g., `admin`, `merchant`, `general`).
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal admin panel configuration only. Never exposed publicly.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1` |
| `name` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | Lowercase string | `merchant` |
| `guard_name` | `VARCHAR(191)` | Required | `web` | *None* | No | Matches auth guard | `api` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 12:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 12:00:00` |

---

## 3. Table: `permissions`
*   **Purpose**: Defines discrete application permissions mapped to roles.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal authorization only. Never exposed publicly.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1` |
| `name` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | Dot notation | `stores.create` |
| `guard_name` | `VARCHAR(191)` | Required | `web` | *None* | No | Matches auth guard | `api` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 12:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 12:00:00` |

---

## 4. Table: `model_has_roles`
*   **Purpose**: Polymorphic pivot table linking users to roles.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal authorization only.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `role_id` | `INT UNSIGNED` | Required | *None* | FK (`roles.id`) | Yes | Cascade on delete | `2` |
| `model_type` | `VARCHAR(191)` | Required | *None* | Composite PK | Yes | Laravel model class | `App\Models\User` |
| `model_id` | `BIGINT UNSIGNED` | Required | *None* | Composite PK | Yes | Matches `users.id` | `12` |

---

## 5. Table: `stores`
*   **Purpose**: Stores storefront configuration settings, localization text, status flags, and owner metadata.
*   **Soft Delete Support**: Yes (`deleted_at`).
*   **Public Exposure Rule**: Publicly exposed and searched via the unique `slug` column. Internal database `id` and `owner_id` are never serialized or returned.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `42` |
| `uuid` | `CHAR(36)` | Required | *None* | Unique Constraint | Yes | Valid UUID v4 | `a3f62c8e-5b12-4c9a-8a1a-c128f9d3b411` |
| `owner_id` | `INT UNSIGNED` | Required | *None* | FK (`users.id`) | Yes | Restrict on delete | `12` |
| `category_id` | `INT UNSIGNED` | Required | *None* | FK (`categories.id`) | Yes | Restrict on delete | `3` |
| `zone_id` | `INT UNSIGNED` | Required | *None* | FK (`zones.id`) | Yes | Restrict on delete | `8` |
| `name_ar` | `VARCHAR(191)` | Required | *None* | *None* | Yes | Arabic text only | `سوبرماركت الياسمين` |
| `name_en` | `VARCHAR(191)` | Nullable | `NULL` | *None* | Yes | English text only | `Al-Yasmin Supermarket` |
| `slug` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | URL friendly, stable | `al-yasmin-supermarket` |
| `description_ar`| `TEXT` | Required | *None* | *None* | No | Arabic text only | `أفضل المنتجات الغذائية...` |
| `description_en`| `TEXT` | Nullable | `NULL` | *None* | No | English text only | `The best organic food...` |
| `status` | `VARCHAR(20)` | Required | `pending` | *None* | Yes | `pending`/`approved`/`rejected` | `approved` |
| `is_active` | `TINYINT(1)` | Required | `0` | *None* | Yes | Boolean toggle (0 or 1) | `1` |
| `latitude` | `DECIMAL(10, 8)`| Required | *None* | *None* | No | Between -90.0 and 90.0 | `31.90234100` |
| `longitude` | `DECIMAL(11, 8)`| Required | *None* | *None* | No | Between -180.0 and 180.0 | `35.20341200` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `deleted_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | Yes | *None* | `NULL` |

---

## 6. Table: `categories`
*   **Purpose**: Organizes stores into business groupings.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Slugs and localized names are public.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `3` |
| `name_ar` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | Arabic name | `مطاعم` |
| `name_en` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | English name | `Restaurants` |
| `slug` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | URL friendly | `restaurants` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 10:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 10:00:00` |

---

## 7. Table: `cities`
*   **Purpose**: First tier of geographic locations.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Publicly exposed list.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1` |
| `name_ar` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | Arabic name | `رام الله` |
| `name_en` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | English name | `Ramallah` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 10:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 10:00:00` |

---

## 8. Table: `zones`
*   **Purpose**: Second tier of geographic locations (sub-zones within a city).
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Publicly exposed list.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `8` |
| `city_id` | `INT UNSIGNED` | Required | *None* | FK (`cities.id`) | Yes | Cascade on delete | `1` |
| `name_ar` | `VARCHAR(191)` | Required | *None* | *None* | No | Arabic name | `الماسيون` |
| `name_en` | `VARCHAR(191)` | Required | *None* | *None* | No | English name | `Al-Masyoun` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 10:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 10:00:00` |

---

## 9. Table: `store_media`
*   **Purpose**: Manages file paths for store logo, cover, and gallery.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: File path URLs are public.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `121` |
| `public_id` | `CHAR(26)` | Required | *None* | Unique Constraint | Yes | ULID format | `01H4F...` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `type` | `VARCHAR(20)` | Required | *None* | *None* | Yes | `logo`/`cover`/`gallery` | `gallery` |
| `file_path` | `VARCHAR(191)` | Required | *None* | *None* | No | Storage file path | `stores/.../logo.png` |
| `disk` | `VARCHAR(50)` | Required | `public` | *None* | No | Storage disk | `public` |
| `original_name`| `VARCHAR(191)` | Nullable | `NULL` | *None* | No | Original file name | `my_logo.png` |
| `mime_type` | `VARCHAR(50)` | Nullable | `NULL` | *None* | No | MIME type | `image/png` |
| `file_size` | `BIGINT UNSIGNED` | Nullable | `NULL` | *None* | No | File size in bytes | `204800` |
| `width` | `INT UNSIGNED` | Nullable | `NULL` | *None* | No | Image width | `800` |
| `height` | `INT UNSIGNED` | Nullable | `NULL` | *None* | No | Image height | `600` |
| `sort_order` | `INT UNSIGNED` | Required | `0` | *None* | Yes | Order in gallery | `3` |
| `alt_text_ar` | `VARCHAR(191)` | Nullable | `NULL` | *None* | No | Arabic alt text | `صورة المتجر` |
| `alt_text_en` | `VARCHAR(191)` | Nullable | `NULL` | *None* | No | English alt text | `Store image` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `deleted_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | Yes | Soft delete | `NULL` |

---

## 10. Table: `store_working_hours`
*   **Purpose**: Manages weekly store operating schedules.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Displayed publicly on store profile.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `311` |
| `public_id` | `CHAR(26)` | Required | *None* | Unique Constraint | Yes | ULID format | `01H4F...` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `day_of_week` | `TINYINT UNSIGNED`| Required | *None* | *None* | No | Range `0` (Sun) to `6` (Sat) | `1` |
| `period_index`| `TINYINT UNSIGNED`| Required | `1` | *None* | No | Period index for the day | `1` |
| `opens_at` | `TIME` | Nullable | `NULL` | *None* | No | `HH:MM:SS` format | `08:00:00` |
| `closes_at` | `TIME` | Nullable | `NULL` | *None* | No | `HH:MM:SS` format | `22:00:00` |
| `is_closed` | `TINYINT(1)` | Required | `0` | *None* | No | Boolean status flag | `0` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |

---

## 11. Table: `store_social_links`
*   **Purpose**: Contains external social links for stores.
*   **Soft Delete Support**: Yes.
*   **Public Exposure Rule**: Displayed publicly on store profile.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `42` |
| `public_id` | `CHAR(26)` | Required | *None* | Unique Constraint | Yes | ULID format | `01H4F...` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `platform` | `VARCHAR(50)` | Required | *None* | *None* | No | Platform Enum | `facebook` |
| `url` | `VARCHAR(191)` | Required | *None* | *None* | No | Valid URL | `https://facebook.com/x`|
| `username` | `VARCHAR(191)` | Nullable | `NULL` | *None* | No | Username | `mystore`|
| `sort_order` | `INT UNSIGNED` | Required | `0` | *None* | Yes | Ordering | `1` |
| `is_active` | `TINYINT(1)` | Required | `1` | *None* | Yes | Active toggle | `1` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `deleted_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | Yes | Soft delete mark | `NULL` |

---

## 12. Table: `offers`
*   **Purpose**: Manages merchant-posted discounts and promotions.
*   **Soft Delete Support**: Yes (`deleted_at`).
*   **Public Exposure Rule**: Publicly resolved via `uuid` column.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `112` |
| `public_id` | `CHAR(26)` | Required | *None* | Unique Constraint | Yes | ULID format | `01H4F...` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `title_ar` | `VARCHAR(191)` | Required | *None* | *None* | No | Arabic text | `خصم 20% على المعجنات` |
| `title_en` | `VARCHAR(191)` | Nullable | `NULL` | *None* | No | English text | `20% Off Pastries` |
| `description_ar`| `TEXT` | Nullable | `NULL` | *None* | No | Arabic text | `يسري العرض حتى نهاية الأسبوع`|
| `description_en`| `TEXT` | Nullable | `NULL` | *None* | No | English text | `Valid until weekend` |
| `price` | `DECIMAL(10, 2)`| Nullable | `NULL` | *None* | No | Current Price | `50.00` |
| `old_price` | `DECIMAL(10, 2)`| Nullable | `NULL` | *None* | No | Old Price | `100.00` |
| `currency` | `CHAR(3)` | Required | `'ILS'` | *None* | No | Currency Code | `ILS` |
| `image_path` | `VARCHAR(191)` | Nullable | `NULL` | *None* | No | Path | `offers/1.jpg` |
| `image_disk` | `VARCHAR(50)` | Nullable | `NULL` | *None* | No | Disk | `public` |
| `starts_at` | `DATETIME` | Nullable | `NULL` | *None* | Yes | `YYYY-MM-DD HH:MM:SS` | `2026-07-14 10:00:00` |
| `ends_at` | `DATETIME` | Nullable | `NULL` | *None* | Yes | `YYYY-MM-DD HH:MM:SS` | `2026-07-21 10:00:00` |
| `is_active` | `TINYINT(1)` | Required | `1` | *None* | Yes | Active Status | `1` |
| `sort_order` | `INT UNSIGNED` | Required | `0` | *None* | Yes | Sorting | `0` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `deleted_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | Yes | *None* | `NULL` |

---

## 13. Table: `subscription_plans`
*   **Purpose**: Defines manual subscription tiers (e.g. Free, Basic, Premium).
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Details are public to merchants.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1` |
| `name_ar` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | Arabic name | `الخطة الأساسية` |
| `name_en` | `VARCHAR(191)` | Required | *None* | Unique Constraint | No | English name | `Basic Plan` |
| `price` | `DECIMAL(10, 2)`| Required | *None* | *None* | No | Price configuration | `150.00` |
| `duration_days` | `INT UNSIGNED` | Required | *None* | *None* | No | Duration length | `365` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 10:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 10:00:00` |

---

## 14. Table: `subscriptions`
*   **Purpose**: Records manual subscription logs for stores.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Exposed in merchant dashboard.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `21` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `plan_id` | `INT UNSIGNED` | Required | *None* | FK (`subscription_plans.id`) | Yes | Restrict on delete | `1` |
| `start_date` | `DATE` | Required | *None* | *None* | Yes | `YYYY-MM-DD` | `2026-07-13` |
| `end_date` | `DATE` | Required | *None* | *None* | Yes | `YYYY-MM-DD` | `2027-07-13` |
| `is_active` | `TINYINT(1)` | Required | `1` | *None* | Yes | Subscription toggle status| `1` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 19:30:00` |

---

## 15. Table: `settings`
*   **Purpose**: Stores dynamic global settings.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal API usage only.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1` |
| `key` | `VARCHAR(191)` | Required | *None* | Unique Constraint | Yes | Alphanumeric dotted | `media.gallery_max_images`|
| `value` | `TEXT` | Required | *None* | *None* | No | Configured string/JSON | `10` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 10:00:00` |
| `updated_at` | `TIMESTAMP` | Nullable | `NULL` | *None* | No | *None* | `2026-07-13 10:00:00` |

---

## 16. Table: `store_status_history`
*   **Purpose**: Audit trail tracking status moderation changes.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal admin dashboard audit records only.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `1331` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `admin_id` | `INT UNSIGNED` | Required | *None* | FK (`users.id`) | Yes | Restrict on delete | `2` |
| `old_status` | `VARCHAR(20)` | Required | *None* | *None* | No | Old store status | `pending` |
| `new_status` | `VARCHAR(20)` | Required | *None* | *None* | No | New store status | `approved` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |

---

## 17. Table: `store_rejection_reasons`
*   **Purpose**: Stores moderation logs describing store rejections.
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Displayed privately on owner merchant's dashboard.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | Required | *None* | PK, Auto Increment | Yes | Positive integer | `51` |
| `store_id` | `INT UNSIGNED` | Required | *None* | FK (`stores.id`) | Yes | Cascade on delete | `42` |
| `admin_id` | `INT UNSIGNED` | Required | *None* | FK (`users.id`) | Yes | Restrict on delete | `2` |
| `reason` | `TEXT` | Required | *None* | *None* | No | Explanatory note | `Incorrect coordinates...` |
| `created_at` | `TIMESTAMP` | Nullable | `CURRENT_TIMESTAMP` | *None* | No | *None* | `2026-07-13 19:30:00` |

---

## 18. Table: `role_has_permissions`
*   **Purpose**: Spatie pivot table mapping roles to permissions (permission_role equivalent).
*   **Soft Delete Support**: No.
*   **Public Exposure Rule**: Internal authorization only.

| Column Name | Suggested MySQL Type | Nullable / Required | Default Value | Keys & Constraints | Index | Validation Notes | Example Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `permission_id`| `INT UNSIGNED` | Required | *None* | FK (`permissions.id`) | Yes | Cascade on delete | `3` |
| `role_id` | `INT UNSIGNED` | Required | *None* | FK (`roles.id`), PK | Yes | Cascade on delete | `2` |

