# Palverse Web Changelog

## [v1.0.0] - 2026-07-15

### Added
- **Public Website**: Home page, Categories, Stores, Offers, Search, and FAQs.
- **Authentication**: User Registration, Login, Logout, Session tracking, and Email Verification.
- **Merchant Onboarding**: Merchant registration and multi-step onboarding wizard.
- **Merchant Dashboard**: Centralized dashboard to view store metrics, active offers, and schedule.
- **Store Management**: Create and edit stores, upload Media (Logo, Cover, Gallery).
- **Working Hours & Socials**: Configure complex working hours, define social media links.
- **Offers System**: Full CRUD for store offers with scheduled/active/expired status handling.
- **Theme Support**: Integrated Light and Dark mode using `next-themes` mapped strictly to Palverse semantic tokens.

### Changed
- Refactored components to remove generic Tailwind colors (e.g., blue, purple, indigo) in favor of the approved Palverse color palette.
- Enhanced API interceptor to cleanly handle 401 Unauthorized errors and emit `palverse:unauthorized` events.
- Centralized auth token management using `getToken` / `setToken`.

### Fixed
- Fixed TypeScript inference issues with Axios instances across services.
- Resolved synchronous `setState` in `useEffect` warnings across multiple merchant components.
- Fixed infinite loading loops in Auth context.

### Removed
- Removed dead template routes and unsupported 'favorites' UI controls based on API limitations.
