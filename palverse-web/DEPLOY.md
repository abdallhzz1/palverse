# Palverse Web — Server Deployment

Source-only package. Build on the server after setting environment variables.

## Requirements

- Node.js 20+ (matches Next.js 16)
- npm

## Steps

1. Upload this folder to the server application root (must contain `package.json`).
2. Create `.env` from `.env.production.example` and set real domain values.
3. Install dependencies:
   ```bash
   npm ci
   ```
   Or use the hosting panel **Run NPM Install** (do not upload `node_modules`).
4. Build:
   ```bash
   npm run build
   ```
5. Start with `server.js` (CloudLinux / Passenger):
   - Startup file: `server.js`
   - Do not use `npm start -- -p 3000`

## Environment variables

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.four7.ps/api/v1` |
| `API_BASE_URL` | `https://api.four7.ps/api/v1` |
| `TRUSTED_ORIGINS` | `https://palverse.four7.ps` |
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |

## API CORS

Ensure the Laravel API allows this origin:

```
PALVERSE_ALLOWED_ORIGINS=https://palverse.four7.ps
```

Then run `php artisan config:cache` on the API server.

## Do not upload

- `node_modules/`
- `.next/`
- `.env` (create on server only)
