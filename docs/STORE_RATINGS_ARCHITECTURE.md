# Store Ratings Architecture

## Overview
The Store Ratings system introduces end-to-end functionality for visitors to leave 1-5 star ratings and reviews on public store pages, and for merchants and admins to view and manage these reviews.

## Components
1. **Public Frontend (palverse-web)**
   - `RatingStarsDisplay`, `RatingStarsInput`, `RatingSummary`, `ReviewForm`
   - Store Pages fetch and display dynamic ratings using `average_rating` and `ratings_count` calculations.
   - 429 Rate Limit error handling, 409 Duplicate submission error handling.

2. **Backend API (palverse-api)**
   - `StoreReview` Model and `store_reviews` table.
   - `Public\ReviewController`: Rate-limited guest submission.
   - `Admin\ReviewController`: Full moderation powers.
   - `Merchant\ReviewController`: Scoped read-only access.
   
3. **Admin Dashboard (palverse-admin)**
   - List and filter reviews by status (`pending`, `published`, `hidden`, `rejected`).
   - Dedicated review detail and moderation page.

## Data Model
- `rating`: 1-5 integer.
- `visitor_token_hash`: SHA-256 hash of the unique guest token generated in the frontend.
- `status`: Managed via `StoreReviewStatus` Enum (`pending`, `published`, `rejected`, `hidden`).
- `reviewed_by`: Admin `User` ID who moderated the review.

## Aggregate Implementation
Aggregates (`average_rating` and `ratings_count`) are currently calculated safely using Laravel's `withAvg('publishedReviews', 'rating')` and `withCount('publishedReviews')`. This avoids the complex N+1 caching bugs associated with denormalization while retaining solid performance for MVP scale.
