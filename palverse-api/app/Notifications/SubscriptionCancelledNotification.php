<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\StoreSubscription;

class SubscriptionCancelledNotification extends BaseNotification
{
    public function __construct(StoreSubscription $subscription)
    {
        $this->type = NotificationType::SUBSCRIPTION_CANCELLED;
        $this->titleAr = 'تم إلغاء الاشتراك';
        $this->titleEn = 'Subscription cancelled';

        $storeNameAr = $subscription->store->name_ar;
        $storeNameEn = $subscription->store->name_en;
        $reason = $subscription->cancellation_reason ?? 'غير محدد';

        $this->messageAr = "تم إلغاء اشتراك محل \"{$storeNameAr}\". السبب: {$reason}";
        $this->messageEn = "The subscription for your store \"{$storeNameEn}\" has been cancelled. Reason: {$reason}";

        $this->entityType = 'subscription';
        $this->entityPublicId = $subscription->public_id;
        $this->actionUrl = '/merchant/stores/'.$subscription->store->slug.'/subscription';

        $this->metadata = [
            'store_public_id' => $subscription->store->public_id,
            'cancellation_reason' => $subscription->cancellation_reason,
        ];
    }
}
