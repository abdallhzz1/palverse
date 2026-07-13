<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Store;

class StoreApprovedNotification extends BaseNotification
{
    public function __construct(Store $store)
    {
        $this->type = NotificationType::STORE_APPROVED;
        $this->titleAr = 'تم قبول المحل';
        $this->titleEn = 'Store approved';
        $this->messageAr = 'تم قبول محل "'.$store->name_ar.'" بنجاح.';
        $this->messageEn = 'Your store "'.$store->name_en.'" has been approved.';
        $this->entityType = 'store';
        $this->entityPublicId = $store->public_id;
        $this->actionUrl = '/merchant/stores/'.$store->slug;
    }
}
