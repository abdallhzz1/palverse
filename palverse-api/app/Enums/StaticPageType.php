<?php

namespace App\Enums;

enum StaticPageType: string
{
    case Content = 'content';
    case Contact = 'contact';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
