<?php

namespace App\Enums;

enum AuditAction: string
{
    // Users
    case UserCreated = 'user.created';
    case UserRegistered = 'user.registered';
    case UserUpdated = 'user.updated';
    case UserActivated = 'user.activated';
    case UserDeactivated = 'user.deactivated';
    case UserSuspended = 'user.suspended';
    case UserRolesUpdated = 'user.roles_updated';
    case UserTokensRevoked = 'user.tokens_revoked';
    case UserPasswordReset = 'user.password_reset';
    case UserPasswordResetSelfService = 'user.password_reset_self_service';

    // Stores
    case StoreCreated = 'store.created';
    case StoreUpdated = 'store.updated';
    case StoreSubmitted = 'store.submitted';
    case StoreApproved = 'store.approved';
    case StoreRejected = 'store.rejected';
    case StoreActivated = 'store.activated';
    case StoreDeactivated = 'store.deactivated';

    // Store Media and Content
    case StoreLogoUploaded = 'store.logo_uploaded';
    case StoreLogoDeleted = 'store.logo_deleted';
    case StoreCoverUploaded = 'store.cover_uploaded';
    case StoreCoverDeleted = 'store.cover_deleted';
    case StoreGalleryUploaded = 'store.gallery_uploaded';
    case StoreGalleryDeleted = 'store.gallery_deleted';
    case StoreGalleryReordered = 'store.gallery_reordered';
    case StoreWorkingHoursUpdated = 'store.working_hours_updated';
    case StoreSocialLinkCreated = 'store.social_link_created';
    case StoreSocialLinkUpdated = 'store.social_link_updated';
    case StoreSocialLinkDeleted = 'store.social_link_deleted';

    // Offers
    case OfferCreated = 'offer.created';
    case OfferUpdated = 'offer.updated';
    case OfferDeleted = 'offer.deleted';
    case OfferActivated = 'offer.activated';
    case OfferDeactivated = 'offer.deactivated';

    // Subscriptions
    case SubscriptionPlanCreated = 'subscription_plan.created';
    case SubscriptionPlanUpdated = 'subscription_plan.updated';
    case SubscriptionPlanDeleted = 'subscription_plan.deleted';
    case SubscriptionAssigned = 'subscription.assigned';
    case SubscriptionCancelled = 'subscription.cancelled';
    case SubscriptionExpired = 'subscription.expired';

    // Settings and Content
    case SettingUpdated = 'setting.updated';
    case PageCreated = 'page.created';
    case PageUpdated = 'page.updated';
    case PagePublished = 'page.published';
    case PageUnpublished = 'page.unpublished';
    case PageDeleted = 'page.deleted';
    case FaqCreated = 'faq.created';
    case FaqUpdated = 'faq.updated';
    case FaqDeleted = 'faq.deleted';
}
