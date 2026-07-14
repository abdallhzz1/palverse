# Admin Frontend Architecture

## Core Technologies
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Folder Structure
- `src/app`: Next.js App Router structure.
  - `(auth)`: Login and related authentication views.
  - `(dashboard)`: Protected dashboard routes.
- `src/components`: UI components built with Tailwind CSS, `clsx`, and `tailwind-merge`.
- `src/lib`: Core utilities (API client, environment validation, error handling).
- `src/providers`: React Context providers (Auth, Theme).
- `src/services`: Service layer interacting with API endpoints.
- `src/types`: TypeScript interfaces reflecting API contracts.

## Authentication Flow
1. User logs in via `/login`.
2. `authService.login` calls API, returning token and user details.
3. `AuthProvider` stores the token in `localStorage`.
4. Subsequent requests to protected backend routes attach the Bearer token via the Axios interceptor.
5. If the token expires (401 Unauthorized), the `AuthProvider` clears the session.

## Error Handling
All API errors are intercepted and normalized in `src/lib/api/error.ts`. This ensures a unified error structure across the UI, particularly for form validations and Toast notifications.

## Routing and Protection
The dashboard utilizes a dual-layout approach:
- `DashboardLayout` enforces authentication and admin role. Redirects guests to `/login` and non-admins to `/unauthorized`.
- `AuthLayout` redirects authenticated users to `/dashboard`.
