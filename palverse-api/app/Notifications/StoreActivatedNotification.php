<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Store;

class StoreActivatedNotification extends BaseNotification
{
    public function __construct(Store $store)
    {
        $this->type = NotificationType::STORE_ACTIVATED;
        $this->titleAr = 'تم تفعيل المحل';
        $this->titleEn = 'Store activated';
        $this->messageAr = 'تم تفعيل محل "'.$store->name_ar.'" وأصبح مرئيًا للعامة.';
        $this->messageEn = 'Your store "'.$store->name_en.'" has been activated and is now visible to the public.';
        $this->entityType = 'store';
        $this->entityPublicId = $store->public_id;
        $this->actionUrl = '/merchant/stores/'.$store->slug;
    }
}
