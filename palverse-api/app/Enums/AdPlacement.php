<?php

namespace App\Enums;

enum AdPlacement: string
{
    case HOME_HERO = 'home_hero';
    case HOME_MID = 'home_mid';
    case STORES_LIST = 'stores_list';
    case STORE_SIDEBAR = 'store_sidebar';

    public function labelAr(): string
    {
        return match ($this) {
            self::HOME_HERO => 'بنر الرئيسية (تحت البحث)',
            self::HOME_MID => 'بنر وسط الرئيسية',
            self::STORES_LIST => 'بنر صفحة المتاجر',
            self::STORE_SIDEBAR => 'بنر جانبي في بروفايل المحل',
        };
    }

    public function aspectRatio(): string
    {
        return match ($this) {
            self::HOME_HERO => '21:9',
            self::HOME_MID, self::STORES_LIST => '21:8',
            self::STORE_SIDEBAR => '4:5',
        };
    }

    public function recommendedSize(): string
    {
        return match ($this) {
            self::HOME_HERO => '1400×600',
            self::HOME_MID, self::STORES_LIST => '1200×460',
            self::STORE_SIDEBAR => '800×1000',
        };
    }

    public function uiVariant(): string
    {
        return match ($this) {
            self::HOME_HERO => 'hero',
            self::HOME_MID, self::STORES_LIST => 'inline',
            self::STORE_SIDEBAR => 'sidebar',
        };
    }

    public function maxConcurrent(): int
    {
        return match ($this) {
            self::STORE_SIDEBAR => 3,
            default => 5,
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function catalog(): array
    {
        return array_map(fn (self $case) => [
            'id' => $case->value,
            'label_ar' => $case->labelAr(),
            'aspect_ratio' => $case->aspectRatio(),
            'recommended_size' => $case->recommendedSize(),
            'ui_variant' => $case->uiVariant(),
            'max_concurrent' => $case->maxConcurrent(),
        ], self::cases());
    }
}
