<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Store;

class StoreDeactivatedNotification extends BaseNotification
{
    public function __construct(Store $store)
    {
        $this->type = NotificationType::STORE_DEACTIVATED;
        $this->titleAr = 'تم تعطيل المحل';
        $this->titleEn = 'Store deactivated';
        $this->messageAr = 'تم تعطيل محل "'.$store->name_ar.'". لم يعد مرئيًا للعامة.';
        $this->messageEn = 'Your store "'.$store->name_en.'" has been deactivated. It is no longer visible to the public.';
        $this->entityType = 'store';
        $this->entityPublicId = $store->public_id;
        $this->actionUrl = '/merchant/stores/'.$store->slug;
    }
}
