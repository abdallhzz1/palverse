# Palverse Admin Dashboard

The foundational Palverse Next.js Admin Dashboard, providing role-based access to the Palverse platform.

## Visual Identity

This dashboard strictly follows the approved Palverse visual identity. 
- **Primary Colors**: Dark Green (`#0F3D2E`), Primary Green (`#1E7D4E`), Muted Green (`#7FA789`), Light Green Background (`#EAF3EC`).
- **Typography**: `Cairo` for Arabic text, `Inter` for Latin/numeric text.
- **Brand Assets**: Logos are located in `public/brand/`.

## Requirements

- Node.js 18+
- Backend API running locally or accessible network

## Installation

1. Clone the repository
2. Install dependencies:
   ```cmd
   npm install
   ```

## Environment Setup

Copy the example environment file and configure it:

```cmd
copy .env.example .env.local
```

Ensure `NEXT_PUBLIC_API_BASE_URL` points to your backend instance.

## Running Development Server

```cmd
npm run dev
```
Access the application at `http://localhost:3000`.

## Architecture & Conventions

- **Next.js App Router**: Uses React Server Components and Client Components.
- **Authentication**: Custom Auth Context managing Sanctum tokens stored in `localStorage`. 
  *Note on Security*: The `localStorage` mechanism is used for this MVP frontend with the limitation that tokens are accessible via JS. Future iterations may explore HttpOnly cookies if the backend configuration allows.
- **Styling**: Tailwind CSS v4 using global theme variables in `src/app/globals.css`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run lint`: Runs ESLint.
- `npx tsc --noEmit`: Runs TypeScript checks.
