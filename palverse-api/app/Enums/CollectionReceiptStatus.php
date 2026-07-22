<?php

namespace App\Enums;

enum CollectionReceiptStatus: string
{
    case ISSUED = 'issued';
    case SETTLED = 'settled';
    case CANCELLED = 'cancelled';
}
