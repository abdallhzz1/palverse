# Palverse Web Known Limitations (v1.0.0)

## API Parity & Unsupported Features
The following features are either not implemented in the frontend or not fully supported by the v1.0.0 API:
- **User Favorites / Wishlist**: The API does not expose endpoints for managing or retrieving favorite stores or offers.
- **Advanced Public Notifications**: Public users (non-merchants) may not have full notification center capabilities exposed via the frontend.
- **Admin Controls**: Administrative features (approving stores, managing global categories, system settings) are isolated to the separate `palverse-admin` panel.

## Security & Storage
- **File Uploads**: Logo, Cover, and Gallery uploads rely on standard HTML forms (`multipart/form-data`) using POST with Laravel spoofing `_method=PUT` when updating.

## Local Environment
- **npm audit**: `npm audit` may fail locally if `registry.npmmirror.com` is configured instead of the main NPM registry, due to the bulk security advisory endpoint not being implemented on the mirror.

## Performance
- **Image Optimization**: Images dynamically uploaded by merchants (covers, logos, offers) rely on Next.js `next/image` optimization. Ensure `next.config.ts` allows the remote hostname for the production API. Currently configured to `localhost`.
