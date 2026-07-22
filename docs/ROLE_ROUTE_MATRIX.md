# Role Route Matrix

This document defines the strict access control mapping across the Palverse ecosystem.

## Frontend (palverse-web)

| Path | Allowed Roles | Redirect if Unauthorized |
| :--- | :--- | :--- |
| `/` | `*` (Public) | N/A |
| `/stores/*` | `*` (Public) | N/A |
| `/login` | Unauthenticated | `/merchant`, `/representative`, `/follow-up`, or `/` |
| `/merchant/*` | `merchant` | `/login` or `/` |
| `/representative/*` | `representative` | `/login` or `/` |
| `/follow-up/*` | `follow_up` | `/login` or `/` |

## Backend API (palverse-api)

All routes below require an active Sanctum token unless specified.

| Route Prefix | Middleware / Policy | Allowed Roles |
| :--- | :--- | :--- |
| `/api/v1/auth/login` | None | `*` (Public) |
| `/api/v1/public/*` | None | `*` (Public) |
| `/api/v1/merchant/*` | `auth:sanctum`, `role:merchant` | `merchant` |
| `/api/v1/representative/*` | `auth:sanctum`, `role:representative` | `representative` |
| `/api/v1/follow-up/*` | `auth:sanctum`, `role:follow_up` | `follow_up` |
| `/api/v1/admin/*` | `auth:sanctum`, `role:admin` | `admin` |

## Admin Dashboard (palverse-admin)

| Path | Allowed Roles | Notes |
| :--- | :--- | :--- |
| `/` (and all sub-routes) | `admin` | Any non-admin attempting to access the `palverse-admin` client will be hard-blocked. |
