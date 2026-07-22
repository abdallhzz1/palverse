<?php

namespace App\Enums;

enum NotificationType: string
{
    case STORE_APPROVED = 'store_approved';
    case STORE_REJECTED = 'store_rejected';
    case STORE_ACTIVATED = 'store_activated';
    case STORE_DEACTIVATED = 'store_deactivated';
    case SUBSCRIPTION_ASSIGNED = 'subscription_assigned';
    case SUBSCRIPTION_CANCELLED = 'subscription_cancelled';
    case SUBSCRIPTION_EXPIRING_SOON = 'subscription_expiring_soon';
    case SUBSCRIPTION_EXPIRED = 'subscription_expired';
    case NEW_JOIN_REQUEST = 'new_join_request';
    case NEW_STORE_REGISTRATION_REQUEST = 'new_store_registration_request';
}
