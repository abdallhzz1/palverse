# Palverse MVP Scope

This document defines the features included in the Minimum Viable Product (MVP) of Palverse, as well as the features deferred to Phase 2.

## MVP Features

### 1. Public Features
The public website and mobile application will support the following functionality for general users (no authentication required for basic browsing):
*   **Multilingual Support**: Full support for Arabic (RTL) and English (LTR).
*   **Browse Stores**: Explore registered business listings.
*   **Browse Categories**: Browse stores filtered by business categories.
*   **Browse Cities and Zones**: Navigate stores by geographical location (cities and sub-zones).
*   **Search Stores**: Full-text or keyword-based search of stores.
*   **Store Profile**: Detailed view of a store including logo, cover image, description, and gallery.
*   **Store Contact Information**: Display of phone numbers, social media links, and address.
*   **WhatsApp and Phone Actions**: Quick buttons to initiate phone calls or open WhatsApp conversations directly.
*   **Google Maps Directions**: View store location on a map and get navigation directions.
*   **Store Offers**: View active discounts, deals, and announcements posted by stores.
*   **Permanent Store URL**: Friendly, static web links (slugs) for stores (e.g., `palverse.ps/store/store-slug`).
*   **QR Code**: Generated QR codes that link directly to the permanent store URL.

### 2. Admin Features
The admin dashboard is restricted to system administrators with Role-Based Access Control (RBAC):
*   **Admin Authentication**: Secure login for administrative personnel.
*   **Dashboard**: Overview of directory health (total stores, pending approvals, active merchants, etc.).
*   **Manage Users**: Create, view, update, and delete users, including assigning roles (Admin, Merchant, General).
*   **Manage Stores**: Create, update, and view store profiles.
*   **Approve and Reject Stores**: Moderation pipeline to approve or reject merchant-submitted stores before they become public.
*   **Manage Categories**: Create, update, and delete directory categories and sub-categories.
*   **Manage Cities and Zones**: Hierarchical management of cities and their zones.
*   **Manage Offers**: Review, edit, and delete store-posted offers.
*   **Manage Store Media**: Moderation and management of logos, covers, and gallery images.
*   **Activate and Deactivate Stores**: Toggle store visibility immediately.
*   **Manage Basic Subscriptions Manually**: Create, edit, and terminate merchant subscriptions manually (without payment gateway integration).
*   **Role-Based Access Control (RBAC)**: Fine-grained permissions for admin accounts.

### 3. Merchant Features
Merchants manage their storefronts through the merchant dashboard/app:
*   **Merchant Authentication**: Secure signup and login for business owners.
*   **Manage Owned Store**: Claim or create a store listing and link it to the merchant's account.
*   **Update Store Information**: Edit description, basic details, and category associations.
*   **Upload Media**: Upload store logo, cover image, and gallery images.
*   **Manage Working Hours**: Specify weekly operating hours.
*   **Manage Contact and Social Links**: Configure phone numbers, WhatsApp, Facebook, Instagram, etc.
*   **Manage Offers**: Create, edit, delete, and schedule discount offers and deals for their store.
*   **View Subscription Status**: Check current subscription package, start/end dates, and status.
*   **Download QR Code**: Obtain high-quality QR code image of their store's permanent URL for offline printing.

---

## Phase 2 Deferred Features

The following features are excluded from the MVP scope and will be implemented in subsequent phases:
*   **Representative Geographic Assignment**: Assigning sales representatives to specific cities/zones.
*   **Representative Commissions**: Tracking and calculating representative commissions based on merchant acquisition.
*   **Cash Collection**: Manual or agent-assisted cash collection workflow.
*   **Digital Receipts**: Issuing electronic receipts for offline payments.
*   **Store Rejection Survey**: Interactive survey collected from merchants when their store application is rejected.
*   **Follow-up Department Calls**: Scheduling and tracking CRM calls to merchants.
*   **Electronic Payment Gateway**: Integration with payment services (credit cards, local gateways) for automatic checkouts.
*   **Automatic Subscription Renewal**: Automatic billing cycles and recurring payments.
*   **Advanced Advertisements**: Sponsored listings, banner slots, and targeted promotions.
*   **Video Uploads**: Uploading and playing video clips on store profiles.
*   **Advanced Financial Reports**: Detailed breakdowns of revenues, commissions, and performance analytics.
