<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\StoreSubscription;

class SubscriptionExpiringSoonNotification extends BaseNotification
{
    public function __construct(StoreSubscription $subscription, int $days)
    {
        $this->type = NotificationType::SUBSCRIPTION_EXPIRING_SOON;
        $this->titleAr = 'اشتراكك سينتهي قريبًا';
        $this->titleEn = 'Subscription expiring soon';

        $storeNameAr = $subscription->store->name_ar;
        $storeNameEn = $subscription->store->name_en;
        $endsAt = $subscription->ends_at->format('Y-m-d');

        $this->messageAr = "سينتهي اشتراك محل \"{$storeNameAr}\" بتاريخ {$endsAt}.";
        $this->messageEn = "The subscription for your store \"{$storeNameEn}\" will expire on {$endsAt}.";

        $this->entityType = 'subscription';
        $this->entityPublicId = $subscription->public_id;
        $this->actionUrl = '/merchant/stores/'.$subscription->store->slug.'/subscription';

        $this->metadata = [
            'store_public_id' => $subscription->store->public_id,
            'ends_at' => $subscription->ends_at->format('Y-m-d H:i:s'),
            'days_remaining' => $days,
            'event_key' => "subscription_expiring_soon:{$subscription->public_id}:{$days}",
        ];
    }
}
