<?php

namespace App\Enums;

enum StoreRequestStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case NEEDS_CHANGES = 'needs_changes';
    case CANCELLED = 'cancelled';

    public function isEditable(): bool
    {
        return in_array($this, [self::DRAFT, self::REJECTED, self::NEEDS_CHANGES]);
    }

    public function isSubmittable(): bool
    {
        return in_array($this, [self::DRAFT, self::REJECTED, self::NEEDS_CHANGES]);
    }

    public function labelAr(): string
    {
        return match($this) {
            self::DRAFT => 'مسودة',
            self::SUBMITTED => 'مقدم',
            self::UNDER_REVIEW => 'قيد المراجعة',
            self::APPROVED => 'معتمد',
            self::REJECTED => 'مرفوض',
            self::NEEDS_CHANGES => 'يحتاج تعديلات',
            self::CANCELLED => 'ملغي',
        };
    }
}
