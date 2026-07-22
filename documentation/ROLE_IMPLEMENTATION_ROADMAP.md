# Palverse Role Implementation Roadmap

**Version**: 1.0
**Created**: 2026-07-16
**Scope**: palverse-api, palverse-web, palverse-admin
**Reference**: See `ROLE_ARCHITECTURE_AUDIT.md` for full audit findings

---

## Overview

This document provides a phased, actionable roadmap for fixing the current merchant role issue and implementing all future roles on the Palverse platform.

### Phase Summary

| Phase | Title | Scope | Priority | Database Migration |
|---|---|---|---|---|
| **1** | Fix Merchant Auth (Critical) | palverse-api + palverse-web | **P0 — Immediate** | ❌ None required |
| **2** | Complete Merchant Dashboard | palverse-web | P1 | ❌ None required |
| **3** | Representative Module | palverse-api + palverse-web | P3 — Phase 2 SRS | ✅ Required |
| **4** | Follow-Up Module | palverse-api + palverse-web | P3 — Phase 2 SRS | ✅ Required |
| **5** | Executive Manager Restrictions | palverse-api + palverse-admin | P3 — Phase 2 SRS | ❌ Seeder only |
| **6** | Customer Role Cleanup | palverse-api + palverse-web | P2 — Technical debt | ❌ None required |

---

## Phase 1 — Fix Merchant Authentication (MVP Blocker)

### Goal
Merchant login works end-to-end. Backend merchant routes are secured by role. The merchant dashboard is accessible to merchants and blocked from all other users.

### Current Bugs Being Fixed

1. All users land on `/account` after login regardless of role
2. `MerchantGuard` uses `role.name` on a string (always `undefined`)
3. "لوحة التاجر" header button never appears for merchants
4. Any authenticated user can call merchant API endpoints

### Backend Changes

**File**: `palverse-api/routes/api.php`

Current (line 139):
```php
Route::prefix('merchant')
    ->middleware(['auth:sanctum'])
    ->group(function (): void {
```

Required:
```php
Route::prefix('merchant')
    ->middleware(['auth:sanctum', 'role:merchant'])
    ->group(function (): void {
```

**Impact**: Any request to `/api/v1/merchant/*` by a non-merchant (customer, admin without merchant role) will now receive `403 Forbidden`. Admin users who need to impersonate merchants should use the admin API.

### Frontend Changes — palverse-web

#### 1. Fix `roles` type in `PublicUser`

**File**: `palverse-web/src/types/auth.ts`

Current:
```ts
roles?: Array<{ name: string; title_ar: string; title_en: string }>;
```

Required:
```ts
roles?: string[];
```

> **Note**: The backend `UserResource` returns `getRoleNames()->values()` which is a plain array of role name strings. This matches the admin app's `AuthUser.roles: string[]` type.

#### 2. Fix login post-login redirect

**File**: `palverse-web/src/app/(auth)/login/page.tsx`

Current (line 14):
```tsx
const returnUrl = searchParams.get("redirect") || "/account";
```

In `handleSubmit`, after login:

Current (line 40):
```tsx
router.replace(returnUrl);
```

Required approach — role-based redirect after login:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const loggedInUser = await login({ email, password, device_name: "palverse-web" });

    // Role-based redirect
    const isMerchant = loggedInUser?.roles?.includes("merchant");
    if (isMerchant) {
      router.replace("/merchant");
    } else {
      // Respect explicit redirect param or fall back to /account
      const redirect = searchParams.get("redirect");
      router.replace(redirect && redirect !== "/login" ? redirect : "/account");
    }
  } catch (err: any) {
    setError(err.message || "فشل تسجيل الدخول. يرجى التحقق من بياناتك.");
  } finally {
    setIsLoading(false);
  }
};
```

> **Note**: This requires `login()` in `AuthContext` to return the logged-in `user` object (or the response to include roles so the component can read them immediately). Verify `AuthContext.login()` signature to ensure it returns user data.

#### 3. Fix `MerchantGuard` role check

**File**: `palverse-web/src/components/merchant/MerchantGuard.tsx`, line 31

Current:
```tsx
const isMerchant = user?.roles?.some((role) => role.name === "merchant");
```

Required:
```tsx
const isMerchant = user?.roles?.includes("merchant");
```

#### 4. Fix `AuthNav` merchant button

**File**: `palverse-web/src/components/auth/AuthNav.tsx`, line 26

Current:
```tsx
const isMerchant = user.roles?.some(r => r.name === "merchant");
```

Required:
```tsx
const isMerchant = user.roles?.includes("merchant");
```

### Tests Required

**Backend** (palverse-api):
- `customer` token + `POST /api/v1/merchant/stores` → 403
- No token + `GET /api/v1/merchant/stores` → 401
- `merchant` token + `GET /api/v1/merchant/stores` → 200

**Frontend** (palverse-web):
- TypeScript: `npx tsc --noEmit` — no errors
- E2E: merchant login → redirect to `/merchant`
- E2E: customer login → redirect to `/account`
- E2E: header shows "لوحة التاجر" for merchants

### Acceptance Criteria

- [ ] `merchant1@palverse.demo` logs in → lands on `/merchant` dashboard
- [ ] `customer1@palverse.demo` logs in → lands on `/account` profile page
- [ ] `admin@palverse.demo` logs into palverse-admin → lands on `/dashboard`
- [ ] Header shows "لوحة التاجر" button when logged in as merchant
- [ ] Header does NOT show "لوحة التاجر" when logged in as customer
- [ ] MerchantGuard shows "Unauthorized" to customers (not dashboard)
- [ ] `POST /api/v1/merchant/stores` with customer token → 403
- [ ] `POST /api/v1/merchant/stores` with no token → 401
- [ ] `POST /api/v1/merchant/stores` with merchant token → 201 / 422 (valid behavior)
- [ ] `php artisan test` passes in palverse-api
- [ ] `npx tsc --noEmit` passes in palverse-web

### Commit Message

```
fix(auth): correct roles type parsing and role-based post-login redirect

- Fix PublicUser.roles type from {name,title_ar}[] to string[]
- Fix MerchantGuard: use roles.includes() instead of role.name check
- Fix AuthNav: same fix for merchant dashboard button visibility
- Fix login page: redirect merchants to /merchant after login
- Add role:merchant middleware to all /api/v1/merchant/* routes

Closes: [issue reference]
```

### Deployment Order

1. Deploy palverse-api first (add `role:merchant` middleware)
2. Deploy palverse-web second (fix types and redirect)
3. Optionally request existing merchants to clear localStorage and re-login

---

## Phase 2 — Complete Merchant Dashboard

### Goal
All MVP merchant capabilities are fully accessible via the frontend. No missing pages. Complete feature parity between the API and the UI.

### Changes Required

#### A. QR Code Download Page

**New file**: `palverse-web/src/app/merchant/stores/[publicId]/qr/page.tsx`

- Call `GET /api/v1/merchant/stores/{publicId}/qr` (returns PNG image or SVG)
- Display QR code image with download button
- Show store slug and permanent URL

#### B. Store Status History Component

**Modify**: `palverse-web/src/app/merchant/stores/[publicId]/page.tsx`

- Call `GET /api/v1/merchant/stores/{publicId}/status`
- Display status timeline (pending → approved / rejected → active)
- Show rejection reasons when applicable

#### C. MerchantSidebar — Add Offers Link

**Modify**: `palverse-web/src/components/merchant/MerchantSidebar.tsx`

The current `navItems` array does not include an offers link. Offers are only accessible via the store-specific routes. Consider adding:
```ts
{ name: "العروض", href: "/merchant/stores", icon: Tag } // Navigate to store to access offers
```

#### D. Verify End-to-End Ownership Enforcement

- Test that merchant A cannot access store B via URL manipulation
- Test media upload ownership on all gallery/logo/cover endpoints
- Test social link ownership on all CRUD operations

### Acceptance Criteria

- [ ] QR code page at `/merchant/stores/{id}/qr` shows scannable QR and download button
- [ ] Store detail page shows status history timeline
- [ ] Merchant cannot access stores owned by another merchant (403)
- [ ] MerchantSidebar includes logical navigation for all major sections

---

## Phase 3 — Representative Module

> **Status**: Phase 2 SRS feature. Do NOT implement until explicitly approved.

### Goal
Build the representative role from database schema through API and frontend dashboard.

### Database Changes Required

New migration files in `palverse-api/database/migrations/`:

```
create_representative_profiles_table.php
create_representative_zone_assignments_table.php
create_store_registration_requests_table.php
create_commission_records_table.php
create_collection_receipts_table.php
```

### Backend Changes

#### New Spatie Role
Add `representative` to `RolesAndPermissionsSeeder.php`:
```php
Role::firstOrCreate(['name' => 'representative', 'guard_name' => 'web']);
```

#### New Permissions
```php
'requests.view',
'requests.submit',
'requests.edit',
'commissions.view',
'receipts.manage',
'zones.assigned.view',
```

#### New Routes
```php
Route::prefix('representative')
    ->middleware(['auth:sanctum', 'role:representative'])
    ->group(function (): void {
        // Dashboard, zone assignments, store requests, commissions, receipts
    });
```

### Frontend Changes

New section in `palverse-web/src/app/representative/` with:
- `layout.tsx` (RepresentativeGuard — `roles.includes("representative")`)
- `page.tsx` (Representative dashboard)
- `zones/page.tsx` (Assigned zones)
- `requests/page.tsx` (Store registration requests)
- `commissions/page.tsx` (Commission tracking)
- `receipts/page.tsx` (Cash collection receipts)

### Acceptance Criteria

- [ ] Representative logs in → lands on `/representative`
- [ ] Representative can only see stores in assigned zones
- [ ] Representative can submit new store registration requests
- [ ] Representative cannot access merchant dashboard
- [ ] Commission records are auditable

---

## Phase 4 — Follow-Up Module

> **Status**: Phase 2 SRS feature. Do NOT implement until explicitly approved.

### Goal
Build the follow-up department role.

### Backend Changes

#### New Spatie Role
```php
Role::firstOrCreate(['name' => 'follow_up', 'guard_name' => 'web']);
```

#### New Permissions
```php
'requests.review',
'renewals.monitor',
'followup_calls.record',
'merchants.contact',
```

#### New Routes
```php
Route::prefix('follow-up')
    ->middleware(['auth:sanctum', 'role:follow_up'])
    ->group(function (): void {
        // Review queue, renewal monitoring, call recording
    });
```

### Frontend Changes

New section in `palverse-web/src/app/follow-up/` with:
- `layout.tsx` (FollowUpGuard)
- `page.tsx` (Follow-up dashboard)
- `requests/page.tsx` (Pending review queue)
- `renewals/page.tsx` (Subscription renewal monitoring)
- `calls/page.tsx` (Call log)

---

## Phase 5 — Executive Manager Admin Restrictions

> **Status**: Phase 2 SRS feature. Do NOT implement until explicitly approved.

### Goal
Allow executive managers to access the admin dashboard with a restricted permission set. They can view reports and store data but cannot manage users, settings, or categories.

### Backend Changes

#### New Spatie Role
```php
$executiveManager = Role::firstOrCreate([
    'name' => 'executive_manager',
    'guard_name' => 'web',
]);

$executiveManager->syncPermissions([
    'stores.view',
    'offers.view',
    'subscriptions.view',
    'audit_logs.view',
]);
```

#### Route Changes
Update admin routes to allow `role:admin|role:executive_manager` or use permission-based checks where appropriate.

### Frontend Changes

**palverse-admin**:
- Update `auth-provider.tsx`: add `isExecutiveManager` computed property
- Update `(dashboard)/layout.tsx`: allow both admin and executive_manager
- Update `dashboard-sidebar`: hide restricted sections (users, settings, categories) based on permissions, not just role
- Update `DashboardHeader`: show correct role badge

### Acceptance Criteria

- [ ] Executive manager logs into palverse-admin → lands on `/dashboard`
- [ ] Executive manager sees stores, offers, subscriptions, audit logs
- [ ] Executive manager cannot access `/dashboard/users`
- [ ] Executive manager cannot access `/dashboard/settings`
- [ ] Admin still has full access

---

## Phase 6 — Customer Role Cleanup

> **Status**: Technical debt. Implement after Phase 1.

### Goal
Remove the orphan `customer` role. No SRS requirement backs it. No pages exist for it. No permissions are assigned to it.

### Changes Required

#### 1. Remove from UpdateUserRolesRequest

**File**: `palverse-api/app/Http/Requests/Api/V1/Admin/UpdateUserRolesRequest.php`

Current:
```php
Rule::in(['admin', 'merchant', 'customer'])
```

Required:
```php
Rule::in(['admin', 'merchant'])
```

> **Warning**: Verify no integration, test, or external tool depends on the ability to assign `customer` role via the API before this change.

#### 2. Remove from DemoUserSeeder (optional)

The demo customer users (`customer1@palverse.demo` through `customer6@palverse.demo`) can be removed from `DemoUserSeeder.php` or kept as test accounts without the customer role.

#### 3. Document the Decision

Add to `documentation/DECISIONS.md`:

```markdown
## ADR-029: Customer Role Deprecation

**Decision**: The `customer` role is deprecated and removed from MVP scope.

**Rationale**: The MVP_SCOPE.md defines three user types: Admin, Merchant, and Guest/Public (unauthenticated). There is no SRS requirement for a logged-in customer role. The role had zero permissions and no dedicated frontend pages. Public browsing requires no authentication.

**Impact**: The `customer` role name is removed from the allowed role assignment values in the admin API. Existing customer accounts (if any) are unaffected but gain no additional capabilities.
```

### Acceptance Criteria

- [ ] `PATCH /api/v1/admin/users/{id}/roles` with `{"roles": ["customer"]}` → 422
- [ ] `php artisan test` passes
- [ ] ADR-029 added to DECISIONS.md

---

## Appendix A: Role Activation Status

| Role | Backend Exists | Frontend Exists | Fully Working | Phase |
|---|---|---|---|---|
| `visitor` (unauthenticated) | N/A | ✅ | ✅ | MVP |
| `merchant` | ✅ | ✅ | ❌ Phase 1 fixes needed | MVP |
| `admin` | ✅ | ✅ (palverse-admin) | ✅ | MVP |
| `customer` | ✅ (orphan) | ❌ | N/A | Deprecate |
| `representative` | ❌ | ❌ | ❌ | Phase 2 |
| `follow_up` | ❌ | ❌ | ❌ | Phase 2 |
| `executive_manager` | ❌ | ❌ | ❌ | Phase 2 |

---

## Appendix B: File Change Summary by Phase

### Phase 1 Files

| File | Type | Change |
|---|---|---|
| `palverse-api/routes/api.php` | PHP | Add `role:merchant` to merchant route group middleware |
| `palverse-web/src/types/auth.ts` | TypeScript | Change `roles` from `{name}[]` to `string[]` |
| `palverse-web/src/app/(auth)/login/page.tsx` | TSX | Implement role-based redirect after login |
| `palverse-web/src/components/merchant/MerchantGuard.tsx` | TSX | Fix `role.name` to `role` in includes check |
| `palverse-web/src/components/auth/AuthNav.tsx` | TSX | Fix `r.name` to `r` in includes check |

### Phase 2 Files

| File | Type | Change |
|---|---|---|
| `palverse-web/src/app/merchant/stores/[publicId]/qr/page.tsx` | TSX | New file — QR code page |
| `palverse-web/src/app/merchant/stores/[publicId]/page.tsx` | TSX | Add status timeline section |
| `palverse-web/src/components/merchant/MerchantSidebar.tsx` | TSX | Add missing nav items |

### Phase 3 Files (Representative)

| File | Type | Change |
|---|---|---|
| `palverse-api/database/migrations/create_representative_profiles_table.php` | PHP | New migration |
| `palverse-api/database/migrations/create_representative_zone_assignments_table.php` | PHP | New migration |
| `palverse-api/database/migrations/create_store_registration_requests_table.php` | PHP | New migration |
| `palverse-api/database/migrations/create_commission_records_table.php` | PHP | New migration |
| `palverse-api/database/migrations/create_collection_receipts_table.php` | PHP | New migration |
| `palverse-api/database/seeders/RolesAndPermissionsSeeder.php` | PHP | Add representative role + permissions |
| `palverse-api/routes/api.php` | PHP | Add representative route group |
| `palverse-web/src/app/representative/**` | TSX | New representative dashboard section |

### Phase 5 Files (Executive Manager)

| File | Type | Change |
|---|---|---|
| `palverse-api/database/seeders/RolesAndPermissionsSeeder.php` | PHP | Add executive_manager role |
| `palverse-admin/src/providers/auth-provider.tsx` | TSX | Add isExecutiveManager computed |
| `palverse-admin/src/app/(dashboard)/layout.tsx` | TSX | Allow executive_manager in guard |
| `palverse-admin/src/components/layout/dashboard-sidebar.tsx` | TSX | Conditional section visibility |

### Phase 6 Files (Customer Cleanup)

| File | Type | Change |
|---|---|---|
| `palverse-api/app/Http/Requests/Api/V1/Admin/UpdateUserRolesRequest.php` | PHP | Remove `customer` from allowed values |
| `documentation/DECISIONS.md` | MD | Add ADR-029 |
