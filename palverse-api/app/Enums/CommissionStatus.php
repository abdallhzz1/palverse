<?php

namespace App\Enums;

enum CommissionStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case PAYABLE = 'payable';
    case PAID = 'paid';
    case CANCELLED = 'cancelled';
}
