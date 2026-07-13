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

## ADR-006: Database Engine

MySQL will be used as the primary relational database.

## ADR-007: Public Identifiers

Internal numeric IDs may be used for database relations, while ULIDs or UUIDs will be used as public identifiers where records may be exposed externally.

## ADR-008: Store Ownership

Each store has one primary merchant owner in the MVP. Future support for multiple managers may be added through a separate pivot table.

## ADR-009: Store Slug

A permanent unique slug is generated when a store is approved. It must not change automatically when the store name changes.

## ADR-010: Monetary Values

All monetary values will be stored using DECIMAL columns and an explicit currency code.

## ADR-011: Localization

Arabic fields are required for business content. English fields are nullable in the MVP.

## ADR-012: Media Storage

Files are stored using Laravel Storage. The database stores paths and metadata, not binary file contents.

## ADR-013: Store Status History

Approval, rejection, activation, and deactivation actions must be recorded in a status history table.

## ADR-014: API Versioning

All Palverse API endpoints will be versioned under `/api/v1`.

## ADR-015: API Response Format

All API responses will use a consistent JSON response structure for success and error cases.

## ADR-016: Public Resource Identifiers

Public and protected API routes will use ULIDs or UUIDs instead of exposing internal numeric IDs.

## ADR-017: Merchant Authorization

Merchant access to stores will be enforced using Laravel Policies, not only route middleware or frontend filtering.

## ADR-018: Public Store Visibility

A store is publicly visible only when it is approved, active, not deleted, and has a valid active subscription.

## ADR-019: API Pagination

All collection endpoints must support pagination. Default and maximum page sizes will be configurable.

## ADR-020: API Error Codes

Machine-readable error codes will be stable and independent from localized human-readable messages.