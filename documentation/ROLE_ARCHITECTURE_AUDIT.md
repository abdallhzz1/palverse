# Palverse Role Architecture Audit

**Audit Date**: 2026-07-16
**Scope**: palverse-api, palverse-web, palverse-admin
**Status**: Read-only — no implementation changes made

---

## 1. Requirements Role Matrix

> Source: `documentation/MVP_SCOPE.md`, `documentation/BUSINESS_RULES.md`, `documentation/DECISIONS.md`

| Arabic Name | Technical Name | Required Dashboard | Data Scope | Login Required | Exists in Code |
|---|---|---|---|---|---|
| زائر عام | `visitor` (unauthenticated) | None — public pages | Public approved+active stores | No | ✅ |
| تاجر | `merchant` | `/merchant` in palverse-web | Own stores only | Yes | ✅ Partial (guard broken) |
| مدير النظام | `admin` | palverse-admin | All records | Yes | ✅ Working |
| زبون | `customer` | None defined by SRS | None | Optional | Orphan role — no SRS backing |
| مندوب مبيعات | `representative` | Separate dashboard (Phase 2) | Assigned zones | Yes | ❌ Entirely missing |
| موظف متابعة | `follow_up` | Separate section (Phase 2) | Permitted queues | Yes | ❌ Entirely missing |
| مدير تنفيذي | `executive_manager` | palverse-admin restricted (Phase 2) | All reports | Yes | ❌ Entirely missing |

**SRS Classification**:
- MVP roles: `visitor`, `merchant`, `admin`
- Phase 2 roles: `representative`, `follow_up`, `executive_manager`
- Orphan role with no SRS definition: `customer`

---

## 2. Current Backend Roles

> Source: `palverse-api/database/seeders/RolesAndPermissionsSeeder.php`

| Role Name | Guard | How Created | Permissions Count |
|---|---|---|---|
| `admin` | web | AdminUserSeeder | All 22 permissions |
| `merchant` | web | MerchantRegistrationService / DemoUserSeeder | 6 permissions |
| `customer` | web | DemoUserSeeder only | 0 permissions |

### Role Assignment Validation (UpdateUserRolesRequest.php)
```php
'roles.*' => ['required', 'string', Rule::in(['admin', 'merchant', 'customer'])],
```
The admin API currently allows assigning only: `admin`, `merchant`, `customer`.

**Finding**: No `representative`, `follow_up`, or `executive_manager` roles exist anywhere in the backend.

---

## 3. Permission Inventory

| Permission | admin | merchant | customer | Protected By |
|---|---|---|---|---|
| `users.view` | ✅ | ❌ | ❌ | permission:users.view middleware |
| `users.manage` | ✅ | ❌ | ❌ | permission:users.manage middleware |
| `stores.view` | ✅ | ✅ | ❌ | StorePolicy |
| `stores.create` | ✅ | ✅ | ❌ | StorePolicy |
| `stores.update` | ✅ | ✅ | ❌ | StorePolicy (owner_id check) |
| `stores.approve` | ✅ | ❌ | ❌ | StorePolicy |
| `stores.reject` | ✅ | ❌ | ❌ | StorePolicy |
| `stores.activate` | ✅ | ❌ | ❌ | StorePolicy |
| `stores.deactivate` | ✅ | ❌ | ❌ | StorePolicy |
| `categories.view` | ✅ | ❌ | ❌ | role:admin route group |
| `categories.manage` | ✅ | ❌ | ❌ | role:admin route group |
| `cities.view` | ✅ | ❌ | ❌ | role:admin route group |
| `cities.manage` | ✅ | ❌ | ❌ | role:admin route group |
| `zones.view` | ✅ | ❌ | ❌ | role:admin route group |
| `zones.manage` | ✅ | ❌ | ❌ | role:admin route group |
| `offers.view` | ✅ | ✅ | ❌ | OfferPolicy |
| `offers.manage` | ✅ | ✅ | ❌ | OfferPolicy |
| `subscriptions.view` | ✅ | ✅ | ❌ | StoreSubscriptionPolicy |
| `subscriptions.manage` | ✅ | ❌ | ❌ | role:admin route group |
| `settings.view` | ✅ | ❌ | ❌ | role:admin route group |
| `settings.manage` | ✅ | ❌ | ❌ | role:admin route group |
| `audit_logs.view` | ✅ | ❌ | ❌ | role:admin route group |

### Security Gaps in Permissions

| Gap | Severity |
|---|---|
| `/api/v1/merchant/*` routes only use `auth:sanctum` — no `role:merchant` middleware | **P0 — Security** |
| `customer` role has no permissions but no route restrictions either | **P0** |
| No `representative`, `follow_up`, or `executive_manager` permissions exist | P1 (Phase 2 prep) |

---

## 4. Auth Response Contract

### Backend Response for `POST /api/v1/auth/login` and `GET /api/v1/auth/me`

```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "public_id": "01JWXYZ...",
      "name": "...",
      "email": "...",
      "status": "active",
      "roles": ["merchant"],
      "permissions": ["stores.view", "stores.create", ...],
      "last_login_at": "...",
      "created_at": "..."
    }
  }
}
```

**Key observations**:
- `roles` is a **plain string array**: `["merchant"]`
- Admin frontend `AuthUser` defines `roles: string[]` — **correct match**
- Web frontend `PublicUser` defines `roles?: Array<{ name: string; title_ar: string; title_en: string }>` — **TYPE MISMATCH — root cause of the bug**

---

## 5. Frontend Auth Flow Analysis

### palverse-web

**Login redirect** (`src/app/(auth)/login/page.tsx`, line 14):
```tsx
const returnUrl = searchParams.get("redirect") || "/account";
```
After login, **all users are redirected to `/account` by default**, regardless of role. Merchant users land on the generic account profile page.

**Role check in MerchantGuard** (`src/components/merchant/MerchantGuard.tsx`, line 31):
```tsx
const isMerchant = user?.roles?.some((role) => role.name === "merchant");
```
Since `roles` is `["merchant"]` (strings), `role.name` is always `undefined`. `isMerchant` is always `false`. **Every merchant is denied access.**

**Role check in AuthNav** (`src/components/auth/AuthNav.tsx`, line 26):
```tsx
const isMerchant = user.roles?.some(r => r.name === "merchant");
```
Same bug. The "لوحة التاجر" button is **never shown** to any merchant.

### palverse-admin

**Role check** (`src/providers/auth-provider.tsx`, line 74):
```ts
return user.roles.includes(role);
```
`AuthUser` uses `roles: string[]` and the backend returns `string[]`. **Correct — admin dashboard works properly.**

---

## 6. Merchant Implementation Status

| Capability | Backend | Frontend Route | Frontend Guard | Status |
|---|---|---|---|---|
| Merchant registration | ✅ | ✅ `/merchant/register` | N/A | ✅ Working |
| Dashboard summary | ✅ GET /merchant/dashboard/summary | ✅ `/merchant` | ❌ MerchantGuard broken | ⚠️ Guard broken |
| Store listing | ✅ GET /merchant/stores | ✅ `/merchant/stores` | ❌ Broken | ⚠️ Guard broken |
| Create store | ✅ POST /merchant/stores | ✅ `/merchant/stores/new` | ❌ Broken | ⚠️ Guard broken |
| Edit store | ✅ PUT /merchant/stores/{id} | ✅ `/merchant/stores/{id}/edit` | ❌ Broken | ⚠️ Guard broken |
| Upload media | ✅ logo/cover/gallery endpoints | ✅ `/merchant/stores/{id}/media` | ❌ Broken | ⚠️ Guard broken |
| Working hours | ✅ | ✅ `/merchant/stores/{id}/hours` | ❌ Broken | ⚠️ Guard broken |
| Social links | ✅ | ✅ `/merchant/stores/{id}/social-links` | ❌ Broken | ⚠️ Guard broken |
| Offers | ✅ | ✅ `/merchant/stores/{id}/offers` | ❌ Broken | ⚠️ Guard broken |
| Subscription view | ✅ | ✅ `/merchant/stores/{id}/subscription` | ❌ Broken | ⚠️ Guard broken |
| QR code download | ✅ | ❌ No dedicated page | N/A | ❌ Frontend missing |
| Store status history | ✅ | ❌ Not shown in UI | N/A | ❌ Frontend missing |
| Onboarding flow | N/A | ✅ `/merchant/onboarding` | ❌ Broken | ⚠️ Guard broken |

**Backend merchant route protection**:
```php
Route::prefix('merchant')
    ->middleware(['auth:sanctum']) // No role:merchant middleware
```
Any authenticated user (including `customer`) can call merchant API endpoints.

---

## 7. Customer Role — Orphan Analysis

The MVP_SCOPE.md defines three user types: Admin, Merchant, Guest/Public (unauthenticated). There is **no SRS requirement for a logged-in customer role**.

| Capability | SRS Requirement | Current State |
|---|---|---|
| Browse without login | ✅ Required | ✅ Implemented |
| Customer registration | ❌ Not required | ✅ Route may exist |
| Customer login | ❌ Not required | Login page serves merchants |
| Customer-specific pages | ❌ Not required | ❌ None exist |
| `customer` role in DB | ❌ Not required | ✅ Exists in seeder |
| `customer` permissions | ❌ Not defined | 0 permissions |

**Verdict**: `customer` is an orphan role. It exists only in seeders and demo data. It should not be assigned via public flow and should be removed from `UpdateUserRolesRequest` allowed values.

---

## 8. Representative Role — Phase 2 Gap

Search across all three projects: zero references to `representative`, `مندوب`, `commission`, `follow-up`.

| Component | Status |
|---|---|
| Database schema | ❌ Missing |
| Backend endpoints | ❌ Missing |
| Spatie role | ❌ Missing |
| Permissions | ❌ Missing |
| Frontend dashboard | ❌ Missing |
| Tests | ❌ Missing |

**Classification**: Correctly deferred to Phase 2.

---

## 9. Follow-Up Role — Phase 2 Gap

Search across all three projects: zero references to `follow_up`, `متابعة`, or follow-up workflow.

All follow-up capabilities are missing. Correctly deferred to Phase 2.

---

## 10. Admin / Executive Manager

**Current state**:
- One `admin` role with all 22 permissions
- No `executive_manager` role exists
- Admin guard correctly uses `roles.includes("admin")` — working

**MVP verdict**: The single `admin` role is sufficient for MVP. Executive manager can be added later as a new Spatie role with a subset of permissions — no database migration required beyond re-running the roles seeder.

---

## 11. Route Protection Audit

### Backend

| Route Group | Auth | Role | Permission | Policy | Ownership |
|---|---|---|---|---|---|
| Public endpoints | None | None | None | None | None |
| `/api/v1/auth/me`, `/logout` | sanctum | None | None | None | Self |
| `/api/v1/merchant/*` | sanctum | **MISSING** | None | StorePolicy (partial) | ✅ owner_id |
| `/api/v1/admin/*` | sanctum | role:admin | permission:* (some) | StorePolicy | None |

### Frontend (palverse-web)

| Route | Auth Guard | Role Guard | Works? |
|---|---|---|---|
| `/` , `/stores/*`, `/categories/*` | None | None | ✅ |
| `/account/*` | ProtectedRoute | None (any auth user) | ✅ |
| `/merchant/*` | MerchantGuard | role.name check (broken) | ❌ |

### Frontend (palverse-admin)

| Route | Auth Guard | Role Guard | Works? |
|---|---|---|---|
| `(dashboard)/*` | isAuthenticated | isAdmin (string includes) | ✅ |
| `(auth)/login` | Redirects if already admin | N/A | ✅ |

---

## 12. Data Ownership Audit

| Scope | Backend Enforcement | Frontend Enforcement |
|---|---|---|
| Merchant sees own stores only | ✅ StorePolicy (owner_id) | ✅ When guard works |
| Merchant cannot edit another's store | ✅ StorePolicy::update (owner_id) | ✅ When guard works |
| Customer cannot call merchant endpoints | ❌ No role:merchant middleware | N/A |
| Admin sees all stores | ✅ role:admin middleware | ✅ |
| Representative sees assigned zones | ❌ Phase 2 | ❌ Phase 2 |

---

## 13. Root-Cause Analysis — The Core Bug

**Problem stated**: "Logging in with a merchant account and a normal user account leads to the same pages."

### Root Cause 1 — Hardcoded Login Redirect (Primary)

**File**: `palverse-web/src/app/(auth)/login/page.tsx`, **line 14**

```tsx
const returnUrl = searchParams.get("redirect") || "/account";
```

After any login, the user is sent to `/account`. Merchant users land on the generic account profile page instead of `/merchant`.

### Root Cause 2 — Roles Type Mismatch (Primary)

**File**: `palverse-web/src/types/auth.ts`, **line 10** (inferred from context)

The `PublicUser` type defines roles as `Array<{ name: string; title_ar: string; title_en: string }>` but the backend's `UserResource` returns `roles: string[]` via `getRoleNames()->values()`.

This causes:
- `MerchantGuard.tsx` line 31: `role.name === "merchant"` → `undefined === "merchant"` → always `false`
- `AuthNav.tsx` line 26: same pattern → merchant dashboard link never appears

### Root Cause 3 — Missing Backend Role Middleware (Security)

**File**: `palverse-api/routes/api.php`, **line 139-141**

```php
Route::prefix('merchant')
    ->middleware(['auth:sanctum']) // no role:merchant
```

Any authenticated user can call merchant endpoints.

### Files With Confirmed Bugs

| File | Line | Bug |
|---|---|---|
| `palverse-web/src/app/(auth)/login/page.tsx` | 14 | Hardcoded `/account` redirect regardless of role |
| `palverse-web/src/types/auth.ts` | ~10 | `roles` typed as `{name,title_ar,title_en}[]` instead of `string[]` |
| `palverse-web/src/components/merchant/MerchantGuard.tsx` | 31 | `role.name` on string is always undefined |
| `palverse-web/src/components/auth/AuthNav.tsx` | 26 | `r.name` on string is always undefined |
| `palverse-api/routes/api.php` | 139 | No `role:merchant` middleware on merchant route group |

---

## 14. Recommended Canonical Role Model

### MVP (Immediate)

| Role | Arabic | Login Via | Dashboard | Data Scope |
|---|---|---|---|---|
| `admin` | مدير النظام | palverse-admin login | palverse-admin | All records |
| `merchant` | تاجر | palverse-web login | `/merchant` in palverse-web | Own stores |
| *(visitor)* | زائر | No login | Public pages | Public approved stores |

### Phase 2 Additions

| Role | Arabic | Dashboard Location |
|---|---|---|
| `representative` | مندوب | `/representative` in palverse-web |
| `follow_up` | متابعة | `/follow-up` in palverse-web |
| `executive_manager` | مدير تنفيذي | palverse-admin (restricted) |

**`customer` role**: Deprecate. Remove from allowed role assignment values.

---

## 15. Recommended Frontend Architecture

### Current
```
palverse-web:   public browsing + merchant dashboard + generic account
palverse-admin: admin dashboard
```

### Recommended (no new projects needed)
```
palverse-web:
  (public)/    → public browsing, zero auth required
  (auth)/      → login, merchant registration
  merchant/    → merchant dashboard [guarded: role === "merchant"]
  account/     → session management, profile [guarded: any authenticated user]

palverse-admin:
  (auth)/login → admin-only login
  (dashboard)/ → admin (+ future executive_manager with restricted permissions)

Future (Phase 2) additions to palverse-web:
  representative/  → representative dashboard [guarded: role === "representative"]
  follow-up/       → follow-up dashboard [guarded: role === "follow_up"]
```

**Rationale**: Admin isolation in `palverse-admin` is correct and must be maintained. Phase 2 operational roles (representative, follow-up) can be added to `palverse-web` since they share the same user authentication system as merchants.

---

## 16. Complete Gap Matrix

| Requirement | Priority | Backend | Frontend Route | Guard | Status | Required Action |
|---|---|---|---|---|---|---|
| Merchant login redirects to `/merchant` | **P0** | N/A | ✅ Exists | ❌ Redirect wrong | ❌ Broken | Fix login redirect to be role-based |
| MerchantGuard correctly identifies merchants | **P0** | N/A | N/A | ❌ Type mismatch | ❌ Broken | Fix `roles: string[]` type |
| "لوحة التاجر" header button shows for merchants | **P0** | N/A | N/A | ❌ Same mismatch | ❌ Broken | Fix AuthNav isMerchant check |
| Backend blocks non-merchants from merchant endpoints | **P0** | ❌ No middleware | N/A | N/A | ❌ Security gap | Add `role:merchant` middleware |
| QR code page in merchant dashboard | P1 | ✅ Endpoint | ❌ No page | N/A | ❌ Missing | Add `/merchant/stores/{id}/qr` page |
| Store status history in merchant dashboard | P1 | ✅ Endpoint | ❌ Not shown | N/A | ❌ Missing | Add status timeline component |
| Merchant sidebar includes offers link | P2 | N/A | N/A | N/A | ⚠️ Partial | Update MerchantSidebar navItems |
| `customer` role deprecated | P2 | ⚠️ Orphan | ❌ None | N/A | ⚠️ Orphan | Remove from allowed role list |
| Representative backend + dashboard | P3 | ❌ | ❌ | ❌ | ❌ Phase 2 | Full Phase 2 feature |
| Follow-up backend + dashboard | P3 | ❌ | ❌ | ❌ | ❌ Phase 2 | Full Phase 2 feature |
| Executive manager admin restrictions | P3 | ❌ | N/A | ❌ | ❌ Phase 2 | Add role + permission scoping |

---

## 17. Phased Implementation Roadmap

### Phase 1 — Critical Fixes (Current Sprint — MVP Blocker)

**Goal**: Merchant login works. Backend merchant routes are secure.

**Backend** (`palverse-api`):
- Add `role:merchant` middleware to all `/api/v1/merchant/*` route groups in `routes/api.php`

**Frontend** (`palverse-web`):
1. Fix `PublicUser.roles` type from `Array<{name, title_ar, title_en}>` to `string[]` in `src/types/auth.ts`
2. Fix login post-login redirect in `src/app/(auth)/login/page.tsx`: check `user.roles` and redirect merchants to `/merchant`, all others to `/account`
3. Fix `MerchantGuard.tsx` line 31: `role.name === "merchant"` → `role === "merchant"`
4. Fix `AuthNav.tsx` line 26: `r.name === "merchant"` → `r === "merchant"`

**Acceptance criteria**:
- Merchant logs in → lands on `/merchant`
- Non-merchant logs in → lands on `/account`
- `customer` token receives 403 on `POST /api/v1/merchant/stores`
- TypeScript compiles without errors in palverse-web

### Phase 2 — Merchant Dashboard Completion

**Goal**: All MVP merchant capabilities are accessible and correct.

- Add QR download page at `/merchant/stores/[publicId]/qr`
- Add store status timeline component to store detail page
- Update MerchantSidebar to include all sections (offers, notifications)
- End-to-end ownership enforcement verification

### Phase 3 — Representative Module (Phase 2 SRS)

- Database: `representative_profiles`, `representative_zone_assignments`, `store_registration_requests`, `commission_records`, `collection_receipts`
- Backend: `representative` Spatie role + permissions + `/api/v1/representative/*` routes
- Frontend: `/representative` dashboard in palverse-web

### Phase 4 — Follow-Up Module (Phase 2 SRS)

- Backend: `follow_up` role + permissions + `/api/v1/follow-up/*` routes
- Frontend: `/follow-up` dashboard in palverse-web

### Phase 5 — Executive Manager Admin Restrictions

- Backend: `executive_manager` Spatie role with subset of admin permissions
- Frontend: Admin dashboard layout adapts based on permissions (not just role)

### Phase 6 — Customer Role Cleanup

- Remove `customer` from `UpdateUserRolesRequest` allowed values
- Remove any speculative customer-facing pages
- Document decision in DECISIONS.md

---

## 18. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Existing merchant tokens continue to work but MerchantGuard still broken until frontend is re-deployed | High | Medium | Deploy frontend fix immediately after backend fix |
| Customers with existing tokens call merchant endpoints before `role:merchant` middleware is added | Medium | Medium | Add middleware first, deploy before frontend changes |
| `customer` role used by external integration | Low | Medium | Search all code and postman collections before removing |
| Representative schema conflicts with existing store/zone design | Medium | High | Review ERD.md thoroughly before Phase 3 |

---

## 19. No-Migration Items (Safe to Fix Now)

The following Phase 1 fixes require **zero database migrations**:

- TypeScript type fix in `auth.ts` — TypeScript change only
- Login redirect logic — frontend JavaScript only
- MerchantGuard and AuthNav role checks — frontend JavaScript only
- `role:merchant` middleware on API routes — PHP code change, no DB migration

---

## 20. Acceptance Criteria Summary

### Phase 1 — Must Pass Before Merge

- [ ] `merchant1@palverse.demo` logs in → immediately lands on `/merchant` (not `/account`)
- [ ] `customer1@palverse.demo` logs in → lands on `/account`
- [ ] `admin@palverse.demo` logs into palverse-admin → lands on `/dashboard`
- [ ] Header shows "لوحة التاجر" button for merchant users
- [ ] Header does NOT show "لوحة التاجر" button for customer users
- [ ] `POST /api/v1/merchant/stores` with customer token → HTTP 403
- [ ] `POST /api/v1/merchant/stores` without token → HTTP 401
- [ ] `php artisan test` passes in palverse-api
- [ ] `npx tsc --noEmit` passes in palverse-web

---

## Appendix A: Files Inspected

| File | Relevant Finding |
|---|---|
| `documentation/MVP_SCOPE.md` | Three MVP roles: admin, merchant, visitor |
| `documentation/BUSINESS_RULES.md` | Role capabilities and RBAC requirements |
| `documentation/DECISIONS.md` | ADR-017, ADR-018, merchant authorization decisions |
| `palverse-api/routes/api.php` | Missing role:merchant middleware on /merchant routes |
| `palverse-api/app/Http/Controllers/Api/V1/Auth/AuthController.php` | Login and me endpoints — confirmed roles format |
| `palverse-api/app/Http/Resources/UserResource.php` | roles returned as getRoleNames()->values() (string[]) |
| `palverse-api/database/seeders/RolesAndPermissionsSeeder.php` | Only 3 roles exist: admin, merchant, customer |
| `palverse-api/app/Policies/StorePolicy.php` | Ownership enforcement via owner_id |
| `palverse-api/app/Services/MerchantRegistrationService.php` | Merchant gets assignRole("merchant") on register |
| `palverse-web/src/types/auth.ts` | Bug: roles typed as objects, should be string[] |
| `palverse-web/src/app/(auth)/login/page.tsx` | Bug: hardcoded /account redirect on line 14 |
| `palverse-web/src/components/merchant/MerchantGuard.tsx` | Bug: role.name check on string always undefined |
| `palverse-web/src/components/auth/AuthNav.tsx` | Bug: same role.name issue in merchant link logic |
| `palverse-admin/src/providers/auth-provider.tsx` | Correct: uses roles.includes("admin") |
| `palverse-admin/src/types/api.ts` | Correct: AuthUser.roles is string[] |
| `palverse-admin/src/app/(dashboard)/layout.tsx` | Correct: isAdmin guard works |
