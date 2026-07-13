<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Store;

class StoreRejectedNotification extends BaseNotification
{
    public function __construct(Store $store, string $reason)
    {
        $this->type = NotificationType::STORE_REJECTED;
        $this->titleAr = 'تم رفض المحل';
        $this->titleEn = 'Store rejected';
        $this->messageAr = 'تم رفض محل "'.$store->name_ar.'". السبب: '.$reason;
        $this->messageEn = 'Your store "'.$store->name_en.'" has been rejected. Reason: '.$reason;
        $this->entityType = 'store';
        $this->entityPublicId = $store->public_id;
        $this->actionUrl = '/merchant/stores/'.$store->slug;
        $this->metadata = ['rejection_reason' => $reason];
    }
}
