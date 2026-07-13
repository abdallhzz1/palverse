<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\StoreSubscription;

class SubscriptionExpiredNotification extends BaseNotification
{
    public function __construct(StoreSubscription $subscription)
    {
        $this->type = NotificationType::SUBSCRIPTION_EXPIRED;
        $this->titleAr = 'انتهى الاشتراك';
        $this->titleEn = 'Subscription expired';

        $storeNameAr = $subscription->store->name_ar;
        $storeNameEn = $subscription->store->name_en;

        $this->messageAr = "انتهى اشتراك محل \"{$storeNameAr}\" وأصبح غير ظاهر للعامة.";
        $this->messageEn = "The subscription for your store \"{$storeNameEn}\" has expired and it is no longer visible to the public.";

        $this->entityType = 'subscription';
        $this->entityPublicId = $subscription->public_id;
        $this->actionUrl = '/merchant/stores/'.$subscription->store->slug.'/subscription';

        $this->metadata = [
            'store_public_id' => $subscription->store->public_id,
            'ends_at' => $subscription->ends_at->format('Y-m-d H:i:s'),
            'event_key' => "subscription_expired:{$subscription->public_id}",
        ];
    }
}
