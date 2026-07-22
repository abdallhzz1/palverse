# Customer Role Deprecation Report

## Overview
The `customer` role was originally included in the architectural foundations to anticipate standard public user capabilities. However, a rigorous audit determined that forcing public users to authenticate creates friction, and the required MVP features (browsing stores, categories, and offers) do not necessitate user identification.

## Deprecation Actions Taken

1. **Role Seeding Halted**: The `RolesAndPermissionsSeeder` no longer generates the `customer` role in fresh environments, and `DemoUserSeeder` no longer seeds demo customer accounts.
2. **Admin Assignment Prevented**: The `UpdateUserRolesRequest` API validation rule and Admin Dashboard role selectors have been updated to strictly allow only operational roles (`admin`, `merchant`, `representative`, `follow_up`).
3. **Public Interfaces Cleaned**:
   - The speculative "Favorites" functionality (and its UI components in the bottom navigation) has been removed.
   - The login page text explicitly addresses operational users, mitigating public user confusion.
4. **Fallback Redirection**: Any existing users with the `customer` role who attempt to log in will be redirected to the public home page rather than a non-existent customer dashboard.

## Handling of Legacy Data
- **No Force Deletion**: Real users assigned the `customer` role were preserved to prevent data loss.
- **Cleanup Command**: A safe CLI command (`php artisan palverse:cleanup-deprecated-customer-role`) was introduced to optionally wipe out demo customer accounts and strip the `customer` role from real users.

## Conclusion
The `customer` role is safely deprecated. Operational role infrastructure remains intact, and the application's boundaries are now firmly defined around Admin, Merchant, Representative, and Follow-Up functions.
