<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\StoreRegistrationRequest;

class NewStoreRegistrationRequestNotification extends BaseNotification
{
    public function __construct(StoreRegistrationRequest $request)
    {
        $this->type = NotificationType::NEW_STORE_REGISTRATION_REQUEST;
        $this->titleAr = 'طلب تسجيل محل جديد من مندوب';
        $this->titleEn = 'New store registration request from representative';
        $this->messageAr = 'تم تقديم طلب تسجيل للمحل «'.$request->store_name_ar.'» بواسطة المندوب.';
        $this->messageEn = 'A store registration request for «'.($request->store_name_en ?: $request->store_name_ar).'» was submitted by a representative.';

        $this->entityType = 'store_registration_request';
        $this->entityPublicId = $request->public_id;
        $this->actionUrl = '/store-requests/'.$request->public_id;

        $this->metadata = [
            'store_registration_request_id' => $request->id,
            'representative_id' => $request->representative_id,
            'city_id' => $request->city_id,
            'zone_id' => $request->zone_id,
        ];
    }
}
