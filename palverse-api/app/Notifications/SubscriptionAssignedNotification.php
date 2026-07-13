<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\StoreSubscription;

class SubscriptionAssignedNotification extends BaseNotification
{
    public function __construct(StoreSubscription $subscription)
    {
        $this->type = NotificationType::SUBSCRIPTION_ASSIGNED;
        $this->titleAr = 'تم تفعيل الاشتراك';
        $this->titleEn = 'Subscription assigned';

        $storeNameAr = $subscription->store->name_ar;
        $storeNameEn = $subscription->store->name_en;
        $planNameAr = $subscription->plan_name_ar_snapshot ?? ($subscription->plan->name_ar ?? '');
        $planNameEn = $subscription->plan_name_en_snapshot ?? ($subscription->plan->name_en ?? '');
        $endsAt = $subscription->ends_at->format('Y-m-d');

        $this->messageAr = "تم تفعيل اشتراك \"{$planNameAr}\" لمحل \"{$storeNameAr}\" حتى {$endsAt}.";
        $this->messageEn = "A \"{$planNameEn}\" subscription has been assigned to your store \"{$storeNameEn}\" until {$endsAt}.";

        $this->entityType = 'subscription';
        $this->entityPublicId = $subscription->public_id;
        $this->actionUrl = '/merchant/stores/'.$subscription->store->slug.'/subscription';

        $this->metadata = [
            'store_public_id' => $subscription->store->public_id,
            'plan_name_ar' => $planNameAr,
            'plan_name_en' => $planNameEn,
            'starts_at' => $subscription->starts_at->format('Y-m-d H:i:s'),
            'ends_at' => $subscription->ends_at->format('Y-m-d H:i:s'),
        ];
    }
}
