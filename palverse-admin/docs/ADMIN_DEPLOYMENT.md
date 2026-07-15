# Palverse Admin Deployment Guide

This document outlines the steps to deploy the Palverse Admin Dashboard to a production environment.

## Prerequisites
- **Node.js**: v18.17.0 or newer (v20+ recommended).
- **npm**: v9 or newer.
- **Backend API**: The Palverse API v1.0.0 must be deployed and accessible.

## 1. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository_url>
cd palverse-admin
npm install
```

## 2. Environment Setup
Create a `.env.local` file for production:
```bash
cp .env.example .env.local
```
Edit `.env.local` with the production API URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.palverse.com/api/v1
NEXT_PUBLIC_APP_NAME="Palverse Admin"
NEXT_PUBLIC_APP_LOCALE=ar
NEXT_PUBLIC_APP_DIRECTION=rtl
NEXT_PUBLIC_API_VERSION=1.0.0
NEXT_PUBLIC_ADMIN_VERSION=1.0.0
```

> [!WARNING]
> Do NOT expose internal server secrets (like DB passwords or API private keys) in the `.env.local` file, as `NEXT_PUBLIC_` variables are bundled into the client build.

## 3. Build for Production
Run the Next.js optimized build process:
```bash
npm run build
```
This generates the optimized `.next` directory and pre-renders static pages.

## 4. Starting the Server
Start the production server:
```bash
npm run start
```
The application will run on `http://localhost:3000` by default.

## 5. Reverse Proxy Notes (Nginx)
When deploying via Nginx, configure the block to proxy requests to the Next.js process:
```nginx
server {
    listen 80;
    server_name admin.palverse.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. API CORS Requirements
The backend Laravel application (`config/cors.php`) must explicitly whitelist the admin domain:
```php
'allowed_origins' => ['https://admin.palverse.com'],
'supports_credentials' => true,
```

## 7. HTTPS Requirement
The dashboard manages authentication tokens and sensitive settings. SSL/HTTPS is strictly required in production.

## 8. Rollback Procedure
If a deployment fails, revert to the previous Git tag and rebuild:
```bash
git checkout v0.9.0
npm install
npm run build
pm2 reload palverse-admin
```
