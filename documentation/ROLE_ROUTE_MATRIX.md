# Palverse Role Route Matrix

**Version**: 1.0
**Audit Date**: 2026-07-16
**Scope**: palverse-api, palverse-web, palverse-admin

This document maps every route to its required role, authentication guard, and current implementation status.

---

## 1. Backend API Routes (`palverse-api`)

### Public — No Authentication

| Method | Path | Controller | Role Required | Status |
|---|---|---|---|---|
| GET | `/api/v1/health` | SystemController@health | None | ✅ |
| GET | `/api/v1/ready` | SystemController@ready | None | ✅ |
| GET | `/api/v1/bootstrap` | BootstrapController | None | ✅ |
| GET | `/api/v1/categories` | PublicCategoryController@index | None | ✅ |
| GET | `/api/v1/categories/{slug}` | PublicCategoryController@show | None | ✅ |
| GET | `/api/v1/cities` | PublicCityController@index | None | ✅ |
| GET | `/api/v1/cities/{id}/zones` | PublicCityController@zones | None | ✅ |
| GET | `/api/v1/stores` | PublicStoreController@index | None | ✅ |
| GET | `/api/v1/stores/{slug}` | PublicStoreController@show | None | ✅ |
| GET | `/api/v1/stores/{slug}/offers` | PublicStoreController@offers | None | ✅ |
| GET | `/api/v1/stores/{slug}/related` | PublicStoreController@related | None | ✅ |
| GET | `/api/v1/stores/{slug}/links` | StoreLinkController@links | None | ✅ |
| GET | `/api/v1/stores/{slug}/qr` | StoreLinkController@qr | None | ✅ |
| GET | `/api/v1/subscription-plans` | PublicSubscriptionPlanController@index | None | ✅ |
| GET | `/api/v1/subscription-plans/{code}` | PublicSubscriptionPlanController@show | None | ✅ |
| GET | `/api/v1/settings` | SystemSettingController@index | None | ✅ |
| GET | `/api/v1/settings/{group}` | SystemSettingController@show | None | ✅ |
| GET | `/api/v1/pages` | StaticPageController@index | None | ✅ |
| GET | `/api/v1/pages/{slug}` | StaticPageController@show | None | ✅ |
| GET | `/api/v1/faqs` | FaqController@index | None | ✅ |
| GET | `/api/v1/search/suggestions` | SearchSuggestionController@suggest | None | ✅ |

### Authentication — No Role Required

| Method | Path | Controller | Middleware | Status |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | AuthController@login | throttle:login | ✅ |
| POST | `/api/v1/auth/register/merchant` | RegisterMerchantController | throttle:merchant-registration | ✅ |
| POST | `/api/v1/auth/forgot-password` | ForgotPasswordController | throttle:forgot-password | ✅ |
| POST | `/api/v1/auth/reset-password` | ResetPasswordController | throttle:password-reset | ✅ |
| GET | `/api/v1/auth/me` | AuthController@me | auth:sanctum | ✅ |
| POST | `/api/v1/auth/logout` | AuthController@logout | auth:sanctum | ✅ |
| GET | `/api/v1/auth/email/status` | VerificationController@status | auth:sanctum | ✅ |
| POST | `/api/v1/auth/email/verification-notification` | VerificationController@send | auth:sanctum | ✅ |
| GET | `/api/v1/auth/email/verify/{id}/{hash}` | VerificationController@verify | throttle | ✅ |
| GET | `/api/v1/auth/sessions` | SessionController@index | auth:sanctum | ✅ |
| DELETE | `/api/v1/auth/sessions/others` | SessionController@destroyOthers | auth:sanctum | ✅ |
| DELETE | `/api/v1/auth/sessions/all` | SessionController@destroyAll | auth:sanctum | ✅ |
| DELETE | `/api/v1/auth/sessions/{id}` | SessionController@destroy | auth:sanctum | ✅ |

### Notifications — Any Authenticated User

| Method | Path | Controller | Middleware | Status |
|---|---|---|---|---|
| GET | `/api/v1/notifications` | NotificationController@index | auth:sanctum | ✅ |
| GET | `/api/v1/notifications/unread-count` | NotificationController@unreadCount | auth:sanctum | ✅ |
| PATCH | `/api/v1/notifications/read-all` | NotificationController@markAllAsRead | auth:sanctum | ✅ |
| PATCH | `/api/v1/notifications/{id}/read` | NotificationController@markAsRead | auth:sanctum | ✅ |

### Merchant — Auth Required (⚠️ Missing role:merchant middleware)

| Method | Path | Controller | Middleware | Ownership | Status |
|---|---|---|---|---|---|
| GET | `/api/v1/merchant/dashboard/summary` | DashboardController@summary | auth:sanctum (**no role:merchant**) | None | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/dashboard/recent-activity` | DashboardController@recentActivity | auth:sanctum | None | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores` | MerchantStoreController@index | auth:sanctum | StorePolicy | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores` | MerchantStoreController@store | auth:sanctum + verified.api | StorePolicy::create | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/dashboard` | DashboardController@storeDashboard | auth:sanctum | Implicit ownership | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}` | MerchantStoreController@show | auth:sanctum | StorePolicy::view | ⚠️ Missing role guard |
| PUT | `/api/v1/merchant/stores/{id}` | MerchantStoreController@update | auth:sanctum + verified.api | StorePolicy::update (owner_id) | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/status` | MerchantStoreController@status | auth:sanctum | Implicit | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores/{id}/logo` | StoreMediaController@storeLogo | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| DELETE | `/api/v1/merchant/stores/{id}/logo` | StoreMediaController@destroyLogo | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores/{id}/cover` | StoreMediaController@storeCover | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| DELETE | `/api/v1/merchant/stores/{id}/cover` | StoreMediaController@destroyCover | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores/{id}/gallery` | StoreMediaController@storeGallery | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| DELETE | `/api/v1/merchant/stores/{id}/gallery/{mediaId}` | StoreMediaController@destroyGallery | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| PATCH | `/api/v1/merchant/stores/{id}/gallery/reorder` | StoreMediaController@reorderGallery | auth:sanctum + verified.api | StorePolicy | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/working-hours` | StoreWorkingHoursController@show | auth:sanctum | Implicit | ⚠️ Missing role guard |
| PUT | `/api/v1/merchant/stores/{id}/working-hours` | StoreWorkingHoursController@update | auth:sanctum | Implicit | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/social-links` | StoreSocialLinkController@index | auth:sanctum | Implicit | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores/{id}/social-links` | StoreSocialLinkController@store | auth:sanctum | Implicit | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/social-links/{linkId}` | StoreSocialLinkController@show | auth:sanctum | Implicit | ⚠️ Missing role guard |
| PUT | `/api/v1/merchant/stores/{id}/social-links/{linkId}` | StoreSocialLinkController@update | auth:sanctum | Implicit | ⚠️ Missing role guard |
| DELETE | `/api/v1/merchant/stores/{id}/social-links/{linkId}` | StoreSocialLinkController@destroy | auth:sanctum | Implicit | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/offers` | OfferController@index | auth:sanctum | OfferPolicy | ⚠️ Missing role guard |
| POST | `/api/v1/merchant/stores/{id}/offers` | OfferController@store | auth:sanctum + verified.api | OfferPolicy | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/offers/{offerId}` | OfferController@show | auth:sanctum | OfferPolicy | ⚠️ Missing role guard |
| PUT | `/api/v1/merchant/stores/{id}/offers/{offerId}` | OfferController@update | auth:sanctum + verified.api | OfferPolicy | ⚠️ Missing role guard |
| DELETE | `/api/v1/merchant/stores/{id}/offers/{offerId}` | OfferController@destroy | auth:sanctum + verified.api | OfferPolicy | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/subscription` | MerchantStoreSubscriptionController@show | auth:sanctum | StoreSubscriptionPolicy | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/subscriptions` | MerchantStoreSubscriptionController@index | auth:sanctum | StoreSubscriptionPolicy | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/links` | Merchant\StoreLinkController@links | auth:sanctum | Implicit | ⚠️ Missing role guard |
| GET | `/api/v1/merchant/stores/{id}/qr` | Merchant\StoreLinkController@qr | auth:sanctum | Implicit | ⚠️ Missing role guard |

### Admin — Requires `role:admin`

| Method | Path | Permission Middleware | Status |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard/summary` | None (role:admin sufficient) | ✅ |
| GET | `/api/v1/admin/dashboard/recent-activity` | None | ✅ |
| GET | `/api/v1/admin/dashboard/stores-by-status` | None | ✅ |
| GET | `/api/v1/admin/dashboard/trends` | None | ✅ |
| GET | `/api/v1/admin/users` | permission:users.view | ✅ |
| POST | `/api/v1/admin/users/merchants` | permission:users.manage | ✅ |
| GET | `/api/v1/admin/users/{id}` | permission:users.view | ✅ |
| PUT | `/api/v1/admin/users/{id}` | permission:users.manage | ✅ |
| PATCH | `/api/v1/admin/users/{id}/activate` | permission:users.manage | ✅ |
| PATCH | `/api/v1/admin/users/{id}/deactivate` | permission:users.manage | ✅ |
| PATCH | `/api/v1/admin/users/{id}/suspend` | permission:users.manage | ✅ |
| PATCH | `/api/v1/admin/users/{id}/roles` | permission:users.manage | ✅ |
| POST | `/api/v1/admin/users/{id}/revoke-tokens` | permission:users.manage | ✅ |
| POST | `/api/v1/admin/users/{id}/reset-password` | permission:users.manage | ✅ |
| GET | `/api/v1/admin/users/{id}/stores` | permission:users.view | ✅ |
| GET | `/api/v1/admin/users/{id}/subscriptions` | permission:users.view | ✅ |
| GET | `/api/v1/admin/categories` | None (role:admin) | ✅ |
| POST | `/api/v1/admin/categories` | None | ✅ |
| GET | `/api/v1/admin/categories/{id}` | None | ✅ |
| PUT | `/api/v1/admin/categories/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/categories/{id}` | None | ✅ |
| GET | `/api/v1/admin/cities` | None | ✅ |
| POST | `/api/v1/admin/cities` | None | ✅ |
| GET | `/api/v1/admin/cities/{id}` | None | ✅ |
| PUT | `/api/v1/admin/cities/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/cities/{id}` | None | ✅ |
| GET | `/api/v1/admin/cities/{id}/zones` | None | ✅ |
| GET | `/api/v1/admin/zones` | None | ✅ |
| POST | `/api/v1/admin/zones` | None | ✅ |
| GET | `/api/v1/admin/zones/{id}` | None | ✅ |
| PUT | `/api/v1/admin/zones/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/zones/{id}` | None | ✅ |
| GET | `/api/v1/admin/stores` | None | ✅ |
| GET | `/api/v1/admin/stores/{id}` | None | ✅ |
| PATCH | `/api/v1/admin/stores/{id}/approve` | None | ✅ |
| PATCH | `/api/v1/admin/stores/{id}/reject` | None | ✅ |
| PATCH | `/api/v1/admin/stores/{id}/activate` | None | ✅ |
| PATCH | `/api/v1/admin/stores/{id}/deactivate` | None | ✅ |
| GET | `/api/v1/admin/stores/{id}/links` | None | ✅ |
| GET | `/api/v1/admin/stores/{id}/qr` | None | ✅ |
| GET | `/api/v1/admin/offers` | None | ✅ |
| GET | `/api/v1/admin/offers/{id}` | None | ✅ |
| PATCH | `/api/v1/admin/offers/{id}/activate` | None | ✅ |
| PATCH | `/api/v1/admin/offers/{id}/deactivate` | None | ✅ |
| DELETE | `/api/v1/admin/offers/{id}` | None | ✅ |
| GET | `/api/v1/admin/subscription-plans` | None | ✅ |
| POST | `/api/v1/admin/subscription-plans` | None | ✅ |
| GET | `/api/v1/admin/subscription-plans/{id}` | None | ✅ |
| PUT | `/api/v1/admin/subscription-plans/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/subscription-plans/{id}` | None | ✅ |
| GET | `/api/v1/admin/subscriptions` | None | ✅ |
| POST | `/api/v1/admin/subscriptions/assign` | None | ✅ |
| GET | `/api/v1/admin/subscriptions/{id}` | None | ✅ |
| PATCH | `/api/v1/admin/subscriptions/{id}/cancel` | None | ✅ |
| GET | `/api/v1/admin/stores/{id}/subscriptions` | None | ✅ |
| GET | `/api/v1/admin/settings` | None | ✅ |
| GET | `/api/v1/admin/settings/{group}` | None | ✅ |
| PUT | `/api/v1/admin/settings` | None | ✅ |
| PUT | `/api/v1/admin/settings/{group}` | None | ✅ |
| GET | `/api/v1/admin/pages` | None | ✅ |
| POST | `/api/v1/admin/pages` | None | ✅ |
| GET | `/api/v1/admin/pages/{id}` | None | ✅ |
| PUT | `/api/v1/admin/pages/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/pages/{id}` | None | ✅ |
| PATCH | `/api/v1/admin/pages/{id}/publish` | None | ✅ |
| PATCH | `/api/v1/admin/pages/{id}/unpublish` | None | ✅ |
| GET | `/api/v1/admin/faqs` | None | ✅ |
| POST | `/api/v1/admin/faqs` | None | ✅ |
| GET | `/api/v1/admin/faqs/{id}` | None | ✅ |
| PUT | `/api/v1/admin/faqs/{id}` | None | ✅ |
| DELETE | `/api/v1/admin/faqs/{id}` | None | ✅ |
| GET | `/api/v1/admin/audit-logs` | None | ✅ |
| GET | `/api/v1/admin/audit-logs/{id}` | None | ✅ |

---

## 2. Frontend Routes — palverse-web

### Public (No Authentication)

| Route | Page Component | Auth Guard | Role Guard | Status |
|---|---|---|---|---|
| `/` | Home | None | None | ✅ |
| `/stores` | Store listing / search | None | None | ✅ |
| `/stores/[slug]` | Store detail | None | None | ✅ |
| `/categories` | Category browse | None | None | ✅ |
| `/categories/[slug]` | Stores in category | None | None | ✅ |
| `/faqs` | FAQ page | None | None | ✅ |
| `/pages/[slug]` | Static content page | None | None | ✅ |

### Authentication Routes

| Route | Page Component | Auth Guard | Notes | Status |
|---|---|---|---|---|
| `/login` | LoginForm | Redirects if authenticated | Redirects all roles to `/account` — **BUG** | ❌ Broken redirect |
| `/register/merchant` | Merchant registration | None | Public self-registration | ✅ |
| `/forgot-password` | Forgot password | None | ✅ | ✅ |
| `/reset-password` | Reset password | None | ✅ | ✅ |
| `/verify-email` | Email verification | ProtectedRoute | ✅ | ✅ |

### Account Routes (Any Authenticated User)

| Route | Page Component | Auth Guard | Role Guard | Status |
|---|---|---|---|---|
| `/account` | Profile page | ProtectedRoute | None | ✅ |
| `/account/notifications` | Notification center | ProtectedRoute | None | ✅ |
| `/account/sessions` | Session management | ProtectedRoute | None | ✅ |
| `/account/favorites` | Favorites (**Phase 2**) | ProtectedRoute | None | ⚠️ Phase 2 |

### Merchant Routes (Requires `merchant` Role)

| Route | Page Component | Auth Guard | Role Guard | Guard Status | Feature Status |
|---|---|---|---|---|---|
| `/merchant` | Dashboard overview | MerchantGuard | `role === "merchant"` | ❌ **Broken** (type mismatch) | ✅ Component exists |
| `/merchant/onboarding` | First-time setup | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores` | Store listing | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/new` | Create store | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]` | Store dashboard | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/edit` | Edit store info | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/media` | Media management | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/hours` | Working hours | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/social-links` | Social links | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/offers` | Offers list | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/offers/new` | Create offer | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/offers/[id]/edit` | Edit offer | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/subscription` | Subscription view | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/stores/[publicId]/qr` | QR download | MerchantGuard | Same | ❌ **Broken** | ❌ **Page missing** |
| `/merchant/notifications` | Notifications | MerchantGuard | Same | ❌ **Broken** | ✅ Component exists |
| `/merchant/subscription` | Subscription overview | MerchantGuard | Same | ❌ **Broken** | ⚠️ Status unknown |

---

## 3. Frontend Routes — palverse-admin

### Authentication

| Route | Component | Behavior | Status |
|---|---|---|---|
| `/login` | Admin Login page | Redirects to `/dashboard` if already `admin` | ✅ |
| `/unauthorized` | Unauthorized page | Shown to authenticated non-admin | ✅ |

### Dashboard (Requires `admin` Role — Verified Working)

| Route | Page | Guard Type | Status |
|---|---|---|---|
| `/dashboard` | Dashboard overview | isAdmin (string includes) | ✅ |
| `/dashboard/users` | User management | isAdmin | ✅ |
| `/dashboard/stores` | Store management | isAdmin | ✅ |
| `/dashboard/categories` | Category management | isAdmin | ✅ |
| `/dashboard/locations` | Cities and zones | isAdmin | ✅ |
| `/dashboard/offers` | Offer management | isAdmin | ✅ |
| `/dashboard/subscriptions` | Subscription management | isAdmin | ✅ |
| `/dashboard/subscription-plans` | Plan management | isAdmin | ✅ |
| `/dashboard/settings` | System settings | isAdmin | ✅ |
| `/dashboard/pages` | Static pages | isAdmin | ✅ |
| `/dashboard/faqs` | FAQ management | isAdmin | ✅ |
| `/dashboard/audit-logs` | Audit trail | isAdmin | ✅ |
| `/dashboard/notifications` | Notifications | isAdmin | ✅ |
| `/dashboard/reports` | Reports | isAdmin | ✅ |

---

## 4. Guard Implementation Comparison

| Guard | File | Implementation | Works? | Notes |
|---|---|---|---|---|
| `ProtectedRoute` | `palverse-web/src/components/auth/ProtectedRoute.tsx` | Checks `isAuthenticated` only | ✅ | Any logged-in user passes |
| `MerchantGuard` | `palverse-web/src/components/merchant/MerchantGuard.tsx` | `user.roles.some(r => r.name === "merchant")` | ❌ | `r.name` is undefined on string |
| `AuthNav isMerchant` | `palverse-web/src/components/auth/AuthNav.tsx` | `user.roles.some(r => r.name === "merchant")` | ❌ | Same bug, merchant link hidden |
| Admin `isAdmin` | `palverse-admin/src/providers/auth-provider.tsx` | `user.roles.includes("admin")` | ✅ | Correct string array check |
| Admin layout guard | `palverse-admin/src/app/(dashboard)/layout.tsx` | `isAuthenticated && isAdmin` | ✅ | Redirects to /unauthorized |

---

## 5. Role Summary Table

| Role | Can Browse Public | Can Login | Backend API Scope | Frontend Scope | Verified Working |
|---|---|---|---|---|---|
| Visitor (no login) | ✅ | N/A | Public endpoints only | Public pages | ✅ |
| merchant | ✅ | ✅ | `/api/v1/merchant/*` (own stores) | `/merchant/*` | ❌ Guard broken |
| admin | ✅ | ✅ (admin app) | `/api/v1/admin/*` | palverse-admin | ✅ |
| customer | ✅ | ✅ | Technically `/api/v1/merchant/*` (security gap) | `/account/*` only | ❌ Security gap |
| representative | ✅ | N/A (Phase 2) | Not implemented | Not implemented | Phase 2 |
| follow_up | ✅ | N/A (Phase 2) | Not implemented | Not implemented | Phase 2 |
| executive_manager | ✅ | N/A (Phase 2) | Not implemented | Not implemented | Phase 2 |

---

## 6. Missing Routes (P0 and P1)

| Missing Item | Priority | Where to Add | Notes |
|---|---|---|---|
| Role-based post-login redirect | **P0** | `palverse-web/src/app/(auth)/login/page.tsx` | Merchant → `/merchant`, others → `/account` |
| `role:merchant` middleware on all merchant API routes | **P0** | `palverse-api/routes/api.php` | Add to route group middleware array |
| Fix `roles` type in `PublicUser` | **P0** | `palverse-web/src/types/auth.ts` | Change from `{name}[]` to `string[]` |
| Fix MerchantGuard `isMerchant` check | **P0** | `palverse-web/src/components/merchant/MerchantGuard.tsx` | `role === "merchant"` not `role.name` |
| Fix AuthNav `isMerchant` check | **P0** | `palverse-web/src/components/auth/AuthNav.tsx` | Same fix |
| QR code page for merchant | P1 | `palverse-web/src/app/merchant/stores/[publicId]/qr/` | Uses existing `/merchant/stores/{id}/qr` API endpoint |
| Store status timeline | P1 | `palverse-web/src/app/merchant/stores/[publicId]/page.tsx` | Uses existing `/stores/{id}/status` API endpoint |
