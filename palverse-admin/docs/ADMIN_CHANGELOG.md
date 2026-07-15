# Changelog

All notable changes to the Palverse Admin Dashboard will be documented in this file.

## [1.0.0] - 2026-07-15

### Added
- **Authentication & Security:** Robust JWT session handling, centralized 401 interceptors, and strict protected route layers.
- **Admin Dashboard:** Real-time KPI summaries, status tracking, and native charts powered by the `DashboardController`.
- **Advanced Reports:** Multi-tab reports for Stores, Subscriptions, Offers, and Users with dynamic period filtering.
- **User Management:** Full CRUD operations for Users and Merchants with role assignment.
- **Store Management:** Store profile inspection, status approval workflows, and working hours display.
- **Locations & Zones:** Native mapping and management of operational zones across Palestinian cities.
- **Taxonomy:** Unified management of multi-level Categories.
- **Offers & Subscriptions:** View active promotional offers and manage Store Subscription Plans.
- **System Settings:** Centralized UI for configuring application globals, branding, and maintenance modes.
- **Static Content:** Integrated WYSIWYG support for static Pages and FAQ blocks.
- **Audit Logging:** Comprehensive tracker for all sensitive actions performed by administrators.
- **Palverse Design System:** Fully responsive (mobile-to-desktop) tailored interface featuring exact Palverse branding (`#0F3D2E`, `#1E7D4E`) and optimized Dark Mode readability.

### Fixed
- Stabilized `react-hook-form` deep unmounting issues.
- Purged all hardcoded mock analytical values, mapping 100% of charts and KPIs directly to the backend.
- Resolved dynamic URL state syncing for report filters.
- Replaced rogue Tailwind blue/indigo defaults with semantic success/warning/destructive variables.
- Standardized Arabic formatting for numbers, dates, and empty states.
