<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\MerchantJoinRequest;

class NewJoinRequestNotification extends BaseNotification
{
    public function __construct(MerchantJoinRequest $joinRequest)
    {
        $this->type = NotificationType::NEW_JOIN_REQUEST;
        $this->titleAr = 'طلب انضمام جديد';
        $this->titleEn = 'New Join Request';
        $this->messageAr = 'قام الزائر ' . $joinRequest->merchant_name . ' بتقديم طلب انضمام لمحل ' . $joinRequest->store_name . '.';
        $this->messageEn = 'Visitor ' . $joinRequest->merchant_name . ' submitted a join request for ' . $joinRequest->store_name . '.';
        
        $this->entityType = 'merchant_join_request';
        $this->entityPublicId = $joinRequest->public_id;
        $this->actionUrl = '/join-requests/' . $joinRequest->public_id;
        
        $this->metadata = [
            'join_request_id' => $joinRequest->id,
            'city_id' => $joinRequest->city_id,
        ];
    }
}
