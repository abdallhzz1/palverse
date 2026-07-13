# Architectural Decisions Record (ADR)

This document details the critical technological decisions, design patterns, and core selections chosen for the Palverse platform.

---

## 1. Backend REST API Framework
*   **Decision**: Laravel REST API.
*   **Rationale**: Laravel provides robust out-of-the-box support for database migrations, security routing, ORM (Eloquent), and form validation, speeding up backend development.
*   **Version Control**: Enforce API versioning under `/api/v1/` to insulate frontends from breaking backend modifications.

---

## 2. Relational Database Engine
*   **Decision**: MySQL.
*   **Rationale**: A mature, stable, open-source relational database that handles transactional consistency, relationships (such as Stores, Cities, Zones, Categories), and complex queries efficiently.

---

## 3. API Authentication Scheme
*   **Decision**: Laravel Sanctum.
*   **Rationale**: Sanctum offers a lightweight authentication system suitable for SPAs (via cookie-based session state authentication) and mobile apps (via bearer tokens), eliminating the overhead of full OAuth2/Passport configurations.

---

## 4. Web Application Stack
*   **Decision**: Next.js (App Router) with TypeScript.
*   **Rationale**: Next.js delivers excellent Server-Side Rendering (SSR) and Static Site Generation (SSG) capabilities, which are essential for SEO, store discovery search indexation, and initial load performance. TypeScript ensures static typing and codebase robustness.

---

## 5. Mobile Application Framework
*   **Decision**: Flutter.
*   **Rationale**: Cross-platform development with a single codebase targeting Android and iOS. Native performance, rich UI widgets, and extensive library ecosystems (such as Riverpod and Google Maps) meet the requirements of a bilingual directory application.

---

## 6. Mobile Client Libraries
*   **State Management**: **Riverpod** is selected for decoupled, compile-safe state monitoring.
*   **Networking**: **Dio** is preferred over the default HTTP package due to rich support for interceptors (ideal for Sanctum token refreshing), request canceling, global config, and file uploading progress.
*   **Routing**: **GoRouter** for declarative navigation, matching the system's URL structure and facilitating deep links to specific store listings.

---

## 7. Geospatial & Map Provider
*   **Decision**: Google Maps API.
*   **Rationale**: Google Maps provides the most accurate and rich geolocated business maps and directions APIs covering Palestinian cities and zones.

---

## 8. Real-time Notifications Engine
*   **Decision**: Firebase Cloud Messaging (FCM).
*   **Rationale**: The industry-standard tool for cross-platform push notifications on iOS and Android with simple server-side integration.
