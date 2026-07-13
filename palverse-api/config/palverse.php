<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Store Media Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the limits and rules for store media uploads.
    |
    */

    'media' => [
        'limits' => [
            'store_gallery_limit' => (int) env('STORE_GALLERY_LIMIT', 10),
            'store_logo_max_kb' => (int) env('STORE_LOGO_MAX_KB', 4096), // 4MB
            'store_cover_max_kb' => (int) env('STORE_COVER_MAX_KB', 6144), // 6MB
            'store_gallery_image_max_kb' => (int) env('STORE_GALLERY_IMAGE_MAX_KB', 4096), // 4MB
        ],
        'allowed_image_mimes' => [
            'jpeg',
            'png',
            'webp',
            'jpg',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Offers Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the limits and rules for offers.
    |
    */

    'offers' => [
        'default_currency' => env('DEFAULT_CURRENCY', 'ILS'),
        'limits' => [
            'offer_image_max_kb' => (int) env('OFFER_IMAGE_MAX_KB', 4096), // 4MB
            'merchant_offer_limit_per_store' => (int) env('MERCHANT_OFFER_LIMIT_PER_STORE', 50),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications Configuration
    |--------------------------------------------------------------------------
    */

    'notifications' => [
        'per_page' => 20,
        'max_per_page' => 100,
        'subscription_expiring_days' => (int) env('SUBSCRIPTION_EXPIRING_DAYS', 7),
    ],
];
