# Deploy Palverse on Vercel + Railway (demo)

Stack split:
- **Railway**: `palverse-api` + MySQL
- **Vercel**: `palverse-web` and `palverse-admin` (two projects)

Repo: monorepo root `https://github.com/abdallhzz1/palverse.git`

## 0. Push latest code

Commit and push `master` (includes Railway/Vercel configs and category approval fix) before connecting platforms.

## 1. Railway — API + MySQL

1. Create account at [railway.app](https://railway.app) and **New Project**.
2. **Add MySQL** service (Add → Database → MySQL).
3. **Add service from GitHub** → select `abdallhzz1/palverse`.
4. In the API service settings:
   - **Root Directory**: `palverse-api`
   - Builder uses `Dockerfile` / `railway.toml` automatically.
5. Open **Variables** and add (use Railway **Variable Reference** for MySQL):

| Variable | Value |
|----------|--------|
| `APP_KEY` | Generate locally: `php artisan key:generate --show` and paste (keep stable) |
| `APP_URL` | `https://<your-api>.up.railway.app` (set after first domain) |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | reference `MySQL.MYSQLHOST` |
| `DB_PORT` | reference `MySQL.MYSQLPORT` |
| `DB_DATABASE` | reference `MySQL.MYSQLDATABASE` |
| `DB_USERNAME` | reference `MySQL.MYSQLUSER` |
| `DB_PASSWORD` | reference `MySQL.MYSQLPASSWORD` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `sync` |
| `SESSION_DRIVER` | `database` |
| `FILESYSTEM_DISK` | `public` |
| `LOG_CHANNEL` | `stderr` |
| `PALVERSE_ALLOW_DEMO_SEEDING` | `true` |
| `PALVERSE_SEED_DEMO_ON_BOOT` | `true` |
| `PALVERSE_DEMO_ADMIN_PASSWORD` | `DemoAdmin123!` |
| `PALVERSE_DEMO_MERCHANT_PASSWORD` | `DemoMerchant123!` |
| `PALVERSE_DEMO_CUSTOMER_PASSWORD` | `DemoCustomer123!` |
| `PALVERSE_DEMO_REPRESENTATIVE_PASSWORD` | `DemoRepresentative123!` |
| `PALVERSE_DEMO_FOLLOW_UP_PASSWORD` | `DemoFollowUp123!` |
| `PALVERSE_ALLOWED_ORIGINS` | both Vercel URLs (comma-separated), update after step 2 |
| `PALVERSE_PUBLIC_WEB_URL` | web Vercel URL |
| `PALVERSE_ADMIN_WEB_URL` | admin Vercel URL |

6. **Settings → Networking → Generate Domain** → copy API URL.
7. Redeploy. First boot runs `migrate` + `palverse:seed-demo`.
8. After demo appears, set `PALVERSE_SEED_DEMO_ON_BOOT=false` (keep data; avoid re-seed noise).

Health check: `GET https://YOUR-API.up.railway.app/api/v1/health`

See also: `palverse-api/.env.railway.example`

## 2. Vercel — Web

1. [vercel.com](https://vercel.com) → Add New Project → import `abdallhzz1/palverse`.
2. **Root Directory**: `palverse-web`
3. Framework: Next.js (auto).
4. Environment variables (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR-API.up.railway.app/api/v1` |
| `API_BASE_URL` | same |
| `TRUSTED_ORIGINS` | `https://YOUR-WEB.vercel.app` (update after deploy) |
| `NEXT_PUBLIC_APP_NAME` | `Palverse` |
| `NEXT_PUBLIC_APP_LOCALE` | `ar` |
| `NEXT_PUBLIC_APP_DIRECTION` | `rtl` |

5. Deploy → copy web URL → update `TRUSTED_ORIGINS` and redeploy if needed.

## 3. Vercel — Admin

Same as web, but:

- **Root Directory**: `palverse-admin`
- Env:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR-API.up.railway.app/api/v1` |
| `API_BASE_URL` | same |
| `TRUSTED_ORIGINS` | `https://YOUR-ADMIN.vercel.app` |
| `NEXT_PUBLIC_WEB_URL` | web Vercel URL |
| `NEXT_PUBLIC_APP_NAME` | `Palverse Admin` |
| `NEXT_PUBLIC_APP_LOCALE` | `ar` |
| `NEXT_PUBLIC_APP_DIRECTION` | `rtl` |

## 4. Wire CORS

On Railway API, set:

```text
PALVERSE_ALLOWED_ORIGINS=https://palverse-xxx.vercel.app,https://palverse-admin-xxx.vercel.app
PALVERSE_PUBLIC_WEB_URL=https://palverse-xxx.vercel.app
PALVERSE_ADMIN_WEB_URL=https://palverse-admin-xxx.vercel.app
```

Redeploy API once.

## 5. Demo logins

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@palverse.demo` | `DemoAdmin123!` |
| Merchant | `merchant1@palverse.demo` | `DemoMerchant123!` |
| Representative | `representative1@palverse.demo` | `DemoRepresentative123!` |
| Follow-up | `followup1@palverse.demo` | `DemoFollowUp123!` |

Admin UI: your admin Vercel URL  
Public web: your web Vercel URL

## Limits (honest)

- Railway free/trial credits can pause the API when exhausted.
- Local/public disk on Railway is **ephemeral** (uploads may vanish on redeploy). Fine for demo; use S3/R2 later.
- Vercel Hobby is free for the two Next apps.

## Manual re-seed (Railway shell)

```bash
php artisan palverse:seed-demo --force
```
