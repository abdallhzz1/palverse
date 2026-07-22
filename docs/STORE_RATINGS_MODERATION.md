# Store Ratings Moderation Strategy

## Moderation Flow
Given the business context of a public directory, we have opted for **Manual Pre-Moderation**.
1. **Submission**: All guest reviews start with a `pending` status.
2. **Admin Action**: Admins can view pending reviews in the Admin Dashboard and take one of two actions:
   - **Approve**: Changes status to `published`, setting `published_at` and `reviewed_by`. The review becomes visible publicly, and affects the store's average rating.
   - **Reject**: Changes status to `rejected`, setting `reviewed_by`. The review is archived.

3. **Post-Moderation**:
   - Admins can **Hide** a previously published review (e.g. if reported or found abusive later).
   - Admins can **Restore** a hidden or rejected review back to `published`.

## Merchant Restrictions
Merchants cannot approve, reject, hide, or edit reviews. They have read-only access strictly scoped to their own stores via the Merchant Dashboard.

## Profanity and Abuse
The system relies on manual moderation by trained admins rather than opaque automated profanity filters which struggle with complex Arabic dialects. Rate limiting (5 reviews per IP/Day) mitigates automated spam.
