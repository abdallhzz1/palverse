<?php

namespace App\Enums;

enum StoreReviewStatus: string
{
    case PENDING = 'pending';
    case PUBLISHED = 'published';
    case REJECTED = 'rejected';
    case HIDDEN = 'hidden';

    public function labelAr(): string
    {
        return match ($this) {
            self::PENDING => 'قيد الانتظار',
            self::PUBLISHED => 'منشور',
            self::REJECTED => 'مرفوض',
            self::HIDDEN => 'مخفي',
        };
    }
}
