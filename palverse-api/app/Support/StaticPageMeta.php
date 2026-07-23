<?php

namespace App\Support;

class StaticPageMeta
{
    /**
     * Allowed meta keys for all page types.
     *
     * @var list<string>
     */
    public const SHARED_KEYS = [
        'hero_eyebrow_ar',
        'hero_eyebrow_en',
    ];

    /**
     * Allowed meta keys for contact pages.
     *
     * @var list<string>
     */
    public const CONTACT_KEYS = [
        'info_card_title_ar',
        'info_card_title_en',
        'phone',
        'phone_label_ar',
        'phone_label_en',
        'phone_hint_ar',
        'phone_hint_en',
        'email',
        'email_label_ar',
        'email_label_en',
        'email_hint_ar',
        'email_hint_en',
        'address_ar',
        'address_en',
        'address_line2_ar',
        'address_line2_en',
        'address_label_ar',
        'address_label_en',
        'whatsapp_number',
        'form_title_ar',
        'form_title_en',
        'submit_label_ar',
        'submit_label_en',
        'map_embed_url',
        'map_lat',
        'map_lng',
    ];

    /**
     * @return list<string>
     */
    public static function allowedKeys(): array
    {
        return array_values(array_unique([...self::SHARED_KEYS, ...self::CONTACT_KEYS]));
    }

    /**
     * @param  array<string, mixed>|null  $meta
     * @return array<string, mixed>|null
     */
    public static function sanitize(?array $meta): ?array
    {
        if ($meta === null) {
            return null;
        }

        $allowed = array_flip(self::allowedKeys());
        $clean = [];

        foreach ($meta as $key => $value) {
            if (! is_string($key) || ! isset($allowed[$key])) {
                continue;
            }

            if ($value === null) {
                $clean[$key] = null;

                continue;
            }

            if (is_bool($value) || is_int($value) || is_float($value)) {
                $clean[$key] = $value;

                continue;
            }

            if (is_string($value)) {
                $trimmed = trim($value);
                $clean[$key] = $trimmed === '' ? null : $trimmed;
            }
        }

        return $clean === [] ? null : $clean;
    }

    /**
     * Default contact meta matching the previous hardcoded UI.
     *
     * @return array<string, string>
     */
    public static function defaultContactMeta(): array
    {
        return [
            'info_card_title_ar' => 'معلومات الاتصال',
            'phone' => '+972 59-388-3932',
            'phone_label_ar' => 'رقم الهاتف',
            'phone_hint_ar' => 'متاحون من 8 صباحاً حتى 5 مساءً',
            'email' => 'info@palverse.ps',
            'email_label_ar' => 'البريد الإلكتروني',
            'email_hint_ar' => 'نرد على رسائلكم خلال 24 ساعة',
            'address_ar' => 'فلسطين، الخليل',
            'address_line2_ar' => 'دائرة السير',
            'address_label_ar' => 'العنوان',
            'whatsapp_number' => '972593883932',
            'form_title_ar' => 'أرسل لنا رسالة',
            'submit_label_ar' => 'إرسال عبر واتساب',
            'map_lat' => '31.557111',
            'map_lng' => '35.096111',
        ];
    }
}
