<?php

namespace App\Enums;

enum CallType: string
{
    case REGISTRATION_REVIEW = 'registration_review';
    case RENEWAL = 'renewal';
    case UNPAID_SUBSCRIPTION = 'unpaid_subscription';
    case MERCHANT_SATISFACTION = 'merchant_satisfaction';
    case REPRESENTATIVE_FOLLOW_UP = 'representative_follow_up';
    case COMPLAINT = 'complaint';
    case GENERAL = 'general';

    public function labelAr(): string
    {
        return match($this) {
            self::REGISTRATION_REVIEW => 'مراجعة طلب تسجيل',
            self::RENEWAL => 'متابعة تجديد',
            self::UNPAID_SUBSCRIPTION => 'اشتراك غير مسدد',
            self::MERCHANT_SATISFACTION => 'قياس رضا التاجر',
            self::REPRESENTATIVE_FOLLOW_UP => 'متابعة مندوب',
            self::COMPLAINT => 'شكوى',
            self::GENERAL => 'عام',
        };
    }
}
