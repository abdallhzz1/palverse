# Store Media and Location Test Report

## Objective
Validate Phase 6 implementation covering Store Media uploading logic and Geographic Location map selections across public, merchant, and representative workflows.

## Verified Workflows

### 1. Database Schema
- [x] Verified `latitude` and `longitude` exist natively in `stores` and `store_registration_requests`.
- [x] Verified `store_media` table correctly associates files via `public_id` and types.

### 2. Validation & Security
- [x] Ensured `latitude` is strictly rejected without `longitude` and vice versa in all 4 Store Requests.
- [x] Confirmed validation intercepts out-of-bounds GPS coordinates natively.
- [x] Confirmed Media Controller respects disk size configurations and strictly limits MIME formats.

### 3. Representative Dashboard
- [x] Tested Leaflet `react-leaflet` rendering accurately inside `src/app/representative/store-requests/new/page.tsx`
- [x] Tested Leaflet rendering inside `src/app/representative/store-requests/[publicId]/edit/page.tsx`.
- [x] Coordinates properly transmit through API on save.

### 4. Merchant Dashboard
- [x] Media mapping successfully shifted to `store.logo?.url` to match the native nested relationship of `StoreResource`.
- [x] Gallery mapping updated properly.
- [x] Leaflet coordinate picker integrated into `new` and `edit` flows.

### 5. Public Views
- [x] NextJS remote patterns explicitly allow local storage domains (`localhost` / `127.0.0.1`).
- [x] Non-interactive maps cleanly render on `src/app/stores/[slug]/page.tsx` using OpenStreetMap tiles.
- [x] 'Get Directions' safely bridges to mobile map clients without API keys.

## Outstanding Risks
- If deployment changes, the frontend API endpoint logic must match the final production domain to serve images properly.
- Production CORS headers must allow `app/public` storage visibility.
