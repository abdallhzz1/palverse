# Palverse Web Deployment Guide

## Prerequisites
- Node.js 18.x or 20.x
- npm 10.x
- Palverse Laravel API (v1.0.0) running and accessible

## 1. Environment Setup

Clone the repository and install dependencies:
```bash
npm install
```

Copy the `.env.example` file:
```bash
cp .env.example .env.local
```

Configure `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.palverse.com/api/v1
NEXT_PUBLIC_APP_NAME="Palverse"
NEXT_PUBLIC_APP_LOCALE="ar"
NEXT_PUBLIC_APP_DIRECTION="rtl"
NEXT_PUBLIC_API_VERSION="1.0.0"
NEXT_PUBLIC_WEB_VERSION="1.0.0"
```

## 2. Build

Build the production bundle:
```bash
npm run build
```

## 3. Start Production Server

```bash
npm run start
```
By default, this will run on port 3000. 

## 4. Deployment via Vercel / Netlify
1. Connect the repository.
2. Set the build command to `npm run build`.
3. Set the output directory to `.next`.
4. Add the environment variables from your `.env.local` to the platform's dashboard.

## 5. PM2 (VPS / Dedicated Server)
```bash
npm install -g pm2
npm run build
pm2 start npm --name "palverse-web" -- run start
```
