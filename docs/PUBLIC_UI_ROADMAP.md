# Public UI & Mobile Web Roadmap

This document outlines the current state and future plans for the Palverse public-facing website.

## Current State (Role Architecture Finalized)
The public interface (`palverse-web`) is fully unauthenticated.

### Core Implemented Features:
- **Responsive PWA Shell:** The application includes a mobile-first bottom navigation schema mapped to standard directory features.
- **Home (`/`):** Universal entry point with curated directories, search, and system settings integration.
- **Categories (`/categories`):** Grid view of all active application categories.
- **Stores (`/stores`):** Advanced, paginated lists of all *active and approved* stores, filterable by location and classification.
- **Store Profile (`/stores/[slug]`):** Public SEO-optimized listing of a store's media, social links, direct contact buttons, and active offers.
- **Offers (`/offers`):** Global directory of promoted offers.
- **Contact & FAQs:** Public informational pages.
- **Merchant Onboarding:** Registration hook at `/merchant/register`.

### Removed/Deprecated:
- **Authentication Wall:** Public users do not need to register.
- **Favorites System:** Speculative "Favorites" component and `/account/favorites` path has been deleted to streamline MVP priorities.
- **Generic Account Portal:** Non-operational users no longer have an `/account` dashboard.

## Future Milestones
- Next phases will focus entirely on implementing the Flutter Mobile Application using Riverpod and Dio, tying directly into these established REST endpoints.
