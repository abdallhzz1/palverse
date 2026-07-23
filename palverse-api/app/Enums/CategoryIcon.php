<?php

namespace App\Enums;

enum CategoryIcon: string
{
    case Grid = 'grid';
    case Restaurant = 'restaurant';
    case Cafe = 'cafe';
    case Shopping = 'shopping';
    case Tech = 'tech';
    case Home = 'home';
    case Services = 'services';
    case Health = 'health';
    case Education = 'education';
    case Automotive = 'automotive';
    case Groceries = 'groceries';
    case Gifts = 'gifts';
    case Crafts = 'crafts';

    public function labelAr(): string
    {
        return match ($this) {
            self::Grid => 'افتراضي',
            self::Restaurant => 'مطاعم',
            self::Cafe => 'مقاهي وحلويات',
            self::Shopping => 'تسوق وأزياء',
            self::Tech => 'إلكترونيات',
            self::Home => 'أثاث ومنزل',
            self::Services => 'خدمات',
            self::Health => 'صحة وتجميل',
            self::Education => 'تعليم وتدريب',
            self::Automotive => 'سيارات',
            self::Groceries => 'بقالة',
            self::Gifts => 'هدايا وزهور',
            self::Crafts => 'حرف محلية',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
