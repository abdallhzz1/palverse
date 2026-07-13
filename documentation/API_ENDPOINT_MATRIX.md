# Palverse API Endpoint Matrix

This matrix maps all endpoints, actors, roles, entity scopes, audit logging, and pagination requirement statuses for the Palverse MVP.

| Endpoint ID | Method | Path | Actor | Role | Authentication | Entity | MVP/Phase 2 | Audit | Pagination | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PUB-01** | GET | `/api/v1/categories` | Visitor | Guest | None | Category | MVP | No | Yes | Active |
| **PUB-02** | GET | `/api/v1/categories/{slug}` | Visitor | Guest | None | Category | MVP | No | No | Active |
| **PUB-03** | GET | `/api/v1/cities` | Visitor | Guest | None | City | MVP | No | No | Active |
| **PUB-04** | GET | `/api/v1/cities/{id}/zones` | Visitor | Guest | None | Zone | MVP | No | No | Active |
| **PUB-05** | GET | `/api/v1/stores` | Visitor | Guest | None | Store | MVP | No | Yes | Active |
| **PUB-06** | GET | `/api/v1/stores/{slug}` | Visitor | Guest | None | Store | MVP | No | No | Active |
| **PUB-07** | GET | `/api/v1/stores/{slug}/offers` | Visitor | Guest | None | Offer | MVP | No | No | Active |
| **PUB-08** | GET | `/api/v1/search` | Visitor | Guest | None | Store | MVP | No | Yes | Active |
| **PUB-09** | GET | `/api/v1/home` | Visitor | Guest | None | Home | MVP | No | No | Active |
| **PUB-10** | GET | `/api/v1/platform-settings/public` | Visitor | Guest | None | Settings | MVP | No | No | Active |
| **ATH-01** | POST | `/api/v1/auth/login` | User | Guest | None | User | MVP | No | No | Active |
| **ATH-02** | POST | `/api/v1/auth/logout` | User | User | Sanctum | User | MVP | No | No | Active |
| **ATH-03** | GET | `/api/v1/auth/me` | User | User | Sanctum | User | MVP | No | No | Active |
| **ATH-04** | POST | `/api/v1/auth/forgot-password` | User | Guest | None | User | MVP | No | No | Active |
| **ATH-05** | POST | `/api/v1/auth/reset-password` | User | Guest | None | User | MVP | No | No | Active |
| **ATH-06** | POST | `/api/v1/auth/change-password` | User | User | Sanctum | User | MVP | No | No | Active |
| **MER-01** | GET | `/api/v1/merchant/dashboard` | Merchant | Merchant | Sanctum | Store | MVP | No | No | Active |
| **MER-02** | GET | `/api/v1/merchant/stores` | Merchant | Merchant | Sanctum | Store | MVP | No | Yes | Active |
| **MER-03** | POST | `/api/v1/merchant/stores` | Merchant | Merchant | Sanctum | Store | MVP | Yes | No | Active |
| **MER-04** | GET | `/api/v1/merchant/stores/{uuid}` | Merchant | Merchant | Sanctum | Store | MVP | No | No | Active |
| **MER-05** | PUT | `/api/v1/merchant/stores/{uuid}` | Merchant | Merchant | Sanctum | Store | MVP | Yes | No | Active |
| **MER-06** | GET | `/api/v1/merchant/stores/{uuid}/status` | Merchant | Merchant | Sanctum | Store | MVP | No | No | Active |
| **MER-07** | GET | `/api/v1/merchant/stores/{uuid}/subscription` | Merchant | Merchant | Sanctum | Subscription | MVP | No | No | Active |
| **MER-08** | GET | `/api/v1/merchant/stores/{uuid}/qr-code` | Merchant | Merchant | Sanctum | Store | MVP | No | No | Active |
| **MER-09** | GET | `/api/v1/merchant/stores/{uuid}/qr-code/download` | Merchant | Merchant | Sanctum | Store | MVP | No | No | Active |
| **MER-10** | POST | `/api/v1/merchant/stores/{uuid}/logo` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-11** | DELETE | `/api/v1/merchant/stores/{uuid}/logo` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-12** | POST | `/api/v1/merchant/stores/{uuid}/cover` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-13** | DELETE | `/api/v1/merchant/stores/{uuid}/cover` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-14** | POST | `/api/v1/merchant/stores/{uuid}/gallery` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-15** | DELETE | `/api/v1/merchant/stores/{uuid}/gallery/{media_id}` | Merchant | Merchant | Sanctum | Media | MVP | Yes | No | Active |
| **MER-16** | PATCH | `/api/v1/merchant/stores/{uuid}/gallery/reorder` | Merchant | Merchant | Sanctum | Media | MVP | No | No | Active |
| **MER-17** | GET | `/api/v1/merchant/stores/{uuid}/working-hours` | Merchant | Merchant | Sanctum | Hours | MVP | No | No | Active |
| **MER-18** | PUT | `/api/v1/merchant/stores/{uuid}/working-hours` | Merchant | Merchant | Sanctum | Hours | MVP | Yes | No | Active |
| **MER-S01**| GET | `/api/v1/merchant/stores/{uuid}/social-links` | Merchant | Merchant | Sanctum | Social | MVP | No | No | Active |
| **MER-S02**| POST | `/api/v1/merchant/stores/{uuid}/social-links` | Merchant | Merchant | Sanctum | Social | MVP | Yes | No | Active |
| **MER-S03**| GET | `/api/v1/merchant/stores/{uuid}/social-links/{socialLinkUuid}` | Merchant | Merchant | Sanctum | Social | MVP | No | No | Active |
| **MER-S04**| PUT | `/api/v1/merchant/stores/{uuid}/social-links/{socialLinkUuid}` | Merchant | Merchant | Sanctum | Social | MVP | Yes | No | Active |
| **MER-S05**| DELETE | `/api/v1/merchant/stores/{uuid}/social-links/{socialLinkUuid}` | Merchant | Merchant | Sanctum | Social | MVP | Yes | No | Active |
| **MER-19** | GET | `/api/v1/merchant/stores/{uuid}/offers` | Merchant | Merchant | Sanctum | Offer | MVP | No | Yes | Active |
| **MER-20** | POST | `/api/v1/merchant/stores/{uuid}/offers` | Merchant | Merchant | Sanctum | Offer | MVP | Yes | No | Active |
| **MER-21** | GET | `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}` | Merchant | Merchant | Sanctum | Offer | MVP | No | No | Active |
| **MER-22** | PUT | `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}` | Merchant | Merchant | Sanctum | Offer | MVP | Yes | No | Active |
| **MER-23** | DELETE | `/api/v1/merchant/stores/{uuid}/offers/{offer_uuid}` | Merchant | Merchant | Sanctum | Offer | MVP | Yes | No | Active |
| **ADM-01** | GET | `/api/v1/admin/dashboard` | Admin | Admin | Sanctum | Dashboard | MVP | No | No | Active |
| **ADM-02** | GET | `/api/v1/admin/users` | Admin | Admin | Sanctum | User | MVP | No | Yes | Active |
| **ADM-03** | GET | `/api/v1/admin/users/{uuid}` | Admin | Admin | Sanctum | User | MVP | No | No | Active |
| **ADM-04** | PATCH | `/api/v1/admin/users/{uuid}/status` | Admin | Admin | Sanctum | User | MVP | Yes | No | Active |
| **ADM-05** | GET | `/api/v1/admin/stores` | Admin | Admin | Sanctum | Store | MVP | No | Yes | Active |
| **ADM-06** | GET | `/api/v1/admin/stores/{uuid}` | Admin | Admin | Sanctum | Store | MVP | No | No | Active |
| **ADM-07** | PATCH | `/api/v1/admin/stores/{uuid}/approve` | Admin | Admin | Sanctum | Store | MVP | Yes | No | Active |
| **ADM-08** | PATCH | `/api/v1/admin/stores/{uuid}/reject` | Admin | Admin | Sanctum | Store | MVP | Yes | No | Active |
| **ADM-09** | PATCH | `/api/v1/admin/stores/{uuid}/activate` | Admin | Admin | Sanctum | Store | MVP | Yes | No | Active |
| **ADM-10** | PATCH | `/api/v1/admin/stores/{uuid}/deactivate` | Admin | Admin | Sanctum | Store | MVP | Yes | No | Active |
| **ADM-11** | GET | `/api/v1/admin/stores/{uuid}/status-history` | Admin | Admin | Sanctum | History | MVP | No | Yes | Active |
| **ADM-12** | GET | `/api/v1/admin/categories` | Admin | Admin | Sanctum | Category | MVP | No | Yes | Active |
| **ADM-13** | POST | `/api/v1/admin/categories` | Admin | Admin | Sanctum | Category | MVP | Yes | No | Active |
| **ADM-14** | GET | `/api/v1/admin/categories/{id}` | Admin | Admin | Sanctum | Category | MVP | No | No | Active |
| **ADM-15** | PUT | `/api/v1/admin/categories/{id}` | Admin | Admin | Sanctum | Category | MVP | Yes | No | Active |
| **ADM-16** | DELETE | `/api/v1/admin/categories/{id}` | Admin | Admin | Sanctum | Category | MVP | Yes | No | Active |
| **ADM-17** | GET | `/api/v1/admin/cities` | Admin | Admin | Sanctum | City | MVP | No | Yes | Active |
| **ADM-18** | POST | `/api/v1/admin/cities` | Admin | Admin | Sanctum | City | MVP | Yes | No | Active |
| **ADM-19** | GET | `/api/v1/admin/cities/{id}` | Admin | Admin | Sanctum | City | MVP | No | No | Active |
| **ADM-20** | PUT | `/api/v1/admin/cities/{id}` | Admin | Admin | Sanctum | City | MVP | Yes | No | Active |
| **ADM-21** | DELETE | `/api/v1/admin/cities/{id}` | Admin | Admin | Sanctum | City | MVP | Yes | No | Active |
| **ADM-22** | GET | `/api/v1/admin/zones` | Admin | Admin | Sanctum | Zone | MVP | No | Yes | Active |
| **ADM-23** | POST | `/api/v1/admin/zones` | Admin | Admin | Sanctum | Zone | MVP | Yes | No | Active |
| **ADM-24** | GET | `/api/v1/admin/zones/{id}` | Admin | Admin | Sanctum | Zone | MVP | No | No | Active |
| **ADM-25** | PUT | `/api/v1/admin/zones/{id}` | Admin | Admin | Sanctum | Zone | MVP | Yes | No | Active |
| **ADM-26** | DELETE | `/api/v1/admin/zones/{id}` | Admin | Admin | Sanctum | Zone | MVP | Yes | No | Active |
| **ADM-27** | GET | `/api/v1/admin/subscription-plans` | Admin | Admin | Sanctum | Plan | MVP | No | Yes | Active |
| **ADM-28** | POST | `/api/v1/admin/subscription-plans` | Admin | Admin | Sanctum | Plan | MVP | Yes | No | Active |
| **ADM-29** | GET | `/api/v1/admin/subscription-plans/{id}` | Admin | Admin | Sanctum | Plan | MVP | No | No | Active |
| **ADM-30** | PUT | `/api/v1/admin/subscription-plans/{id}` | Admin | Admin | Sanctum | Plan | MVP | Yes | No | Active |
| **ADM-31** | DELETE | `/api/v1/admin/subscription-plans/{id}` | Admin | Admin | Sanctum | Plan | MVP | Yes | No | Active |
| **ADM-32** | GET | `/api/v1/admin/subscriptions` | Admin | Admin | Sanctum | Subscription | MVP | No | Yes | Active |
| **ADM-33** | POST | `/api/v1/admin/subscriptions` | Admin | Admin | Sanctum | Subscription | MVP | Yes | No | Active |
| **ADM-34** | GET | `/api/v1/admin/subscriptions/{id}` | Admin | Admin | Sanctum | Subscription | MVP | No | No | Active |
| **ADM-35** | PUT | `/api/v1/admin/subscriptions/{id}` | Admin | Admin | Sanctum | Subscription | MVP | Yes | No | Active |
| **ADM-36** | PATCH | `/api/v1/admin/subscriptions/{id}/activate` | Admin | Admin | Sanctum | Subscription | MVP | Yes | No | Active |
| **ADM-37** | PATCH | `/api/v1/admin/subscriptions/{id}/expire` | Admin | Admin | Sanctum | Subscription | MVP | Yes | No | Active |
| **ADM-38** | PATCH | `/api/v1/admin/subscriptions/{id}/cancel` | Admin | Admin | Sanctum | Subscription | MVP | Yes | No | Active |
| **ADM-39** | GET | `/api/v1/admin/settings` | Admin | Admin | Sanctum | Settings | MVP | No | No | Active |
| **ADM-40** | PUT | `/api/v1/admin/settings` | Admin | Admin | Sanctum | Settings | MVP | Yes | No | Active |
| **ADM-41** | GET | `/api/v1/admin/offers` | Admin | Admin | Sanctum | Offer | MVP | No | Yes | Active |
| **ADM-42** | GET | `/api/v1/admin/offers/{uuid}` | Admin | Admin | Sanctum | Offer | MVP | No | No | Active |
| **ADM-43** | PATCH | `/api/v1/admin/offers/{uuid}/activate` | Admin | Admin | Sanctum | Offer | MVP | Yes | No | Active |
| **ADM-44** | PATCH | `/api/v1/admin/offers/{uuid}/deactivate` | Admin | Admin | Sanctum | Offer | MVP | Yes | No | Active |
| **ADM-45** | DELETE | `/api/v1/admin/offers/{uuid}` | Admin | Admin | Sanctum | Offer | MVP | Yes | No | Active |
