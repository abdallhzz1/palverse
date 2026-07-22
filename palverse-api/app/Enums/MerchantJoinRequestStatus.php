<?php

namespace App\Enums;

enum MerchantJoinRequestStatus: string
{
    case NEW = 'new';
    case CONTACTED = 'contacted';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function labelAr(): string
    {
        return match($this) {
            self::NEW => 'جديد',
            self::CONTACTED => 'تم التواصل',
            self::APPROVED => 'تم الموافقة',
            self::REJECTED => 'مرفوض',
        };
    }
}
