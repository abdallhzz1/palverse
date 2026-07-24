# Palverse Public Visual Reference Guide

## Brand photos (AI-generated lifestyle)
Located in `public/brand/photos/`:

| File | Role |
|------|------|
| `hero-market-cafe.jpg` | Home hero (full-bleed) |
| `browse-stores-street.jpg` | `/stores` hero |
| `browse-categories-shopfronts.jpg` | `/categories` hero |
| `offers-lifestyle.jpg` | `/offers` hero + offer image fallback |
| `join-merchant-workspace.jpg` | `/join-us` hero |
| `join-benefit-atmosphere.jpg` | Join benefits + partner banner fallback |
| `cms-about-community.jpg` | CMS / about shell |
| `contact-warm-desk.jpg` | Contact shell |
| `blog-editorial.jpg` | Blog hero + article cover fallback |
| `faq-soft-help.jpg` | FAQ header |
| `auth-register-side.jpg` | Merchant register / auth side art |
| `empty-search.jpg` | Empty search states |
| `store-cover-fallback.jpg` | Missing store cover |

Access via `src/lib/brand-photos.ts` (`BRAND_PHOTOS`).

## Design rules
- Keep Palverse greens: `#0F3D2E`, `#1E7D4E`, `#7FA789`, `#EAF3EC`, `#F5F7F6`.
- Home and page heroes use **full-bleed photography** with soft green reading gradients — not inset cards or floating badges.
- First viewport: brand signal + one headline + one subtitle + one CTA/search group + dominant image.
- Do **not** use Dome of the Rock / Al-Aqsa as the primary homepage hero.
- Legacy illustrations under `public/brand/illustrations/` remain available for niche decoration only.
- Cards only where the user interacts (store, offer, article).
- Fonts: Cairo (headings) + IBM Plex Sans Arabic (body).

## Shared components
- `PublicPageHero` — photo heroes
- `EmptyStateArt` — empty results with lifestyle photo
- `Header` / `Footer` / `BottomNav` — public chrome
