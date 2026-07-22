# Palverse Web Route Inventory (v1.0.0)

## Public Routes
- `/` - Home Page
- `/categories` - Browse all categories
- `/categories/[slug]` - Stores in a specific category
- `/stores` - Search and list all stores
- `/stores/[slug]` - Public store details
- `/offers` - Browse all global offers
- `/faqs` - Frequently Asked Questions
- `/pages/[slug]` - Static content pages

## Authentication Routes
- `/login` - User login
- `/register` - Regular user registration
- `/register/merchant` - Merchant account registration
- `/forgot-password` - Request password reset link
- `/reset-password` - Reset password form
- `/verify-email` - Email verification wait/status page

## Account Routes (Requires Auth)
- `/account/profile` - Manage user profile
- `/account/security` - Change password
- `/account/sessions` - View and revoke active sessions
- `/account/notifications` - Public user notification center

## Merchant Routes (Requires Auth & Merchant Role)
- `/merchant` - Merchant Dashboard Summary
- `/merchant/onboarding` - First-time store creation flow
- `/merchant/stores` - List all owned stores
- `/merchant/stores/new` - Create additional store
- `/merchant/stores/[publicId]` - Specific store dashboard
- `/merchant/stores/[publicId]/edit` - Edit store information
- `/merchant/stores/[publicId]/media` - Manage Logo, Cover, Gallery
- `/merchant/stores/[publicId]/hours` - Manage working hours
- `/merchant/stores/[publicId]/social-links` - Manage social media profiles
- `/merchant/stores/[publicId]/offers` - Manage store offers
- `/merchant/stores/[publicId]/offers/new` - Create offer
- `/merchant/stores/[publicId]/offers/[offerId]/edit` - Edit offer
- `/merchant/stores/[publicId]/subscription` - View active subscription
- `/merchant/notifications` - Merchant notification center
