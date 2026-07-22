<?php

namespace App\Enums;

enum RefusalReasonCode: string
{
    case PRICE = 'price';
    case NOT_INTERESTED = 'not_interested';
    case ALREADY_SUBSCRIBED = 'already_subscribed';
    case NEEDS_MORE_INFORMATION = 'needs_more_information';
    case CONTACT_LATER = 'contact_later';
    case TRUST_CONCERN = 'trust_concern';
    case OTHER = 'other';

    public function labelAr(): string
    {
        return match($this) {
            self::PRICE => 'السعر مرتفع',
            self::NOT_INTERESTED => 'غير مهتم',
            self::ALREADY_SUBSCRIBED => 'مشترك بالفعل',
            self::NEEDS_MORE_INFORMATION => 'يحتاج معلومات أكثر',
            self::CONTACT_LATER => 'يرجى التواصل لاحقاً',
            self::TRUST_CONCERN => 'مخاوف من الثقة',
            self::OTHER => 'أخرى',
        };
    }
}
