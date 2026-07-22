# Final Role Architecture

This document defines the final canonical roles, permissions, and architectural constraints for Palverse, solidifying the application's access control boundaries after the final role cleanup phase.

## Active Canonical Roles

The platform operates using exactly four database-backed roles.

| Role Key | Arabic Label | Description | Default Redirect | Source |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | مدير النظام | Complete platform control and management | `palverse-admin` (`/`) | Created via console |
| `merchant` | تاجر | Store owners managing their own business | `palverse-web` (`/merchant`) | Public Registration |
| `representative` | مندوب مبيعات | Field sales and merchant acquisition | `palverse-web` (`/representative`) | Created by Admin |
| `follow_up` | متابعة | Quality assurance and unpaid subscription management | `palverse-web` (`/follow-up`) | Created by Admin |

## Excluded Roles

*   **`executive_manager`**: Explicitly out of scope. Not implemented.
*   **`customer`**: Deprecated. No longer assigned. Kept in the database only for legacy record preservation.

## Public Visitor

*   **Identity**: Unauthenticated user.
*   **Database Record**: None. No `customer` role is created or required.
*   **Permissions**: Can freely browse all public-facing content (Home, Stores, Offers, Categories, Contact, Blog).
*   **Constraints**:
    *   Cannot access any dashboard.
    *   Is not forced to log in for general browsing.
    *   No "favorites" feature or generic "account dashboard".

## Shared Account Settings

A shared account settings architecture exists for operational users (`merchant`, `representative`, `follow_up`) to manage their individual details.

**Available Pages:**
*   `/account/profile`
*   `/account/security`
*   `/account/sessions`
*   `/account/notifications`

If a legacy user (e.g., `customer` or roleless) attempts to log in, they will authenticate but be redirected to the public home (`/`) as they do not have a dedicated dashboard, and their access to operational endpoints is strictly blocked.

## Route Protection & Guards

*   **Public Web (`palverse-web`)**:
    *   Operational dashboards (`/merchant`, `/representative`, `/follow-up`) are protected by strictly evaluating the authenticated user's assigned role against the requested path.
*   **API (`palverse-api`)**:
    *   `/api/v1/merchant/*`: Protected by `auth:sanctum` and `role:merchant`.
    *   `/api/v1/representative/*`: Protected by `auth:sanctum` and `role:representative`.
    *   `/api/v1/follow-up/*`: Protected by `auth:sanctum` and `role:follow_up`.
    *   `/api/v1/admin/*`: Protected by `auth:sanctum`, `role:admin`, and fine-grained Spatie permissions.

## Login and Authentication

The login page (`/login`) is expressly designated for **operational users**. It provides authentication routing for admins (if accessed via web, though admins primarily use `palverse-admin`), merchants, representatives, and follow-up staff.

**Registration**:
*   `/merchant/register`: The only permitted public registration flow.
*   All other operational accounts (`representative`, `follow_up`) must be provisioned internally by an `admin`.
