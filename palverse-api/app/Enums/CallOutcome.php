<?php

namespace App\Enums;

enum CallOutcome: string
{
    case ANSWERED = 'answered';
    case NO_ANSWER = 'no_answer';
    case BUSY = 'busy';
    case WRONG_NUMBER = 'wrong_number';
    case CALLBACK_REQUESTED = 'callback_requested';
    case RESOLVED = 'resolved';
    case NEEDS_FOLLOW_UP = 'needs_follow_up';
    case DECLINED = 'declined';
    case RENEWED = 'renewed';
    case SATISFIED = 'satisfied';
    case DISSATISFIED = 'dissatisfied';

    public function labelAr(): string
    {
        return match($this) {
            self::ANSWERED => 'تم الرد',
            self::NO_ANSWER => 'لا يوجد رد',
            self::BUSY => 'مشغول',
            self::WRONG_NUMBER => 'رقم خاطئ',
            self::CALLBACK_REQUESTED => 'طلب معاودة الاتصال',
            self::RESOLVED => 'تم الحل',
            self::NEEDS_FOLLOW_UP => 'يحتاج متابعة',
            self::DECLINED => 'رفض / غير مهتم',
            self::RENEWED => 'تم التجديد',
            self::SATISFIED => 'راضي',
            self::DISSATISFIED => 'غير راضي',
        };
    }
}
