# Phase 1: Merchant Role Architecture Implementation Report

**Date**: 2026-07-16
**Scope**: Fix merchant role authentication and access control.

## 1. Overview
The P0 fixes for the merchant role architecture have been successfully implemented. The goal was to secure backend merchant API endpoints with the correct Spatie role middleware and fix the frontend role-checking logic that was blocking merchants from their own dashboard.

## 2. Changes Implemented

### Backend (`palverse-api`)
- **Route Protection**: Added the `role:merchant` middleware to all routes under the `api/v1/merchant` route group in `routes/api.php`.
- **Authorization Tests**: Added `tests/Feature/Api/V1/Merchant/MerchantRoleAuthorizationTest.php` to prove that:
  - Unauthenticated users get `401 Unauthorized`.
  - Customers/non-merchants get `403 Forbidden`.
  - Merchants get `200 OK` (or appropriate business-logic validation responses).

### Frontend (`palverse-web`)
- **Type Correction**: Fixed `PublicUser.roles` in `src/types/auth.ts` from an array of objects to `string[]` to match the backend response. Added `permissions?: string[]`.
- **Centralized Role Helper**: Created `src/lib/auth/roles.ts` to cleanly handle role array parsing and provide `isMerchantRole()`.
- **Role-Based Redirect Logic**: Created `src/lib/auth/role-redirect.ts` with `getPostLoginPath()` to handle safe redirects:
  - Merchants always redirect to `/merchant`.
  - Customers redirect to safe internal paths or `/account`.
- **Auth Context**: Updated `AuthContext.tsx` `login()` method signature to return `Promise<PublicUser>` so that `login/page.tsx` can make immediate redirect decisions without state staleness.
- **Login Page Fix**: Updated `src/app/(auth)/login/page.tsx` to remove the hardcoded `/account` fallback, using `getPostLoginPath` instead. Prevented redirect loops.
- **Guard Fix**: Updated `MerchantGuard.tsx` to use `isMerchantRole`.
- **Navigation Fixes**: Updated `AuthNav.tsx` and `MobileNavDrawer.tsx` to use `isMerchantRole` so the "لوحة التاجر" button appears correctly for merchants.

## 3. Verification & Security
- **Role Assumptions Checked**: Grep search verified no remaining `role.name` object assumptions exist in the frontend.
- **Admin Isolation**: `palverse-admin` logic remains untouched and fully functional. The `AuthUser.roles: string[]` logic matches our frontend fix.
- **Policies Preserved**: Route middleware `role:merchant` adds a layer of defense; the existing `StorePolicy` continues to enforce ownership (a merchant can only see their *own* stores).
- **Public Website Intact**: `MerchantGuard` only protects merchant pages. Public pages require no authentication.

## 4. Pending Items (Phase 2 & Technical Debt)
- **Customer Role Cleanup**: The `customer` role is still functionally an orphan but will be removed in a later technical debt phase (Phase 6).
- **QR & Status Pages**: Missing frontend merchant pages will be implemented in Phase 2.
- **Representative / Follow-up / Executive Manager**: Modules remain unstarted per SRS Phase 2 roadmap.
