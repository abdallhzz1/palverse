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

    /*
    |--------------------------------------------------------------------------
    | Store Links & QR Configuration
    |--------------------------------------------------------------------------
    */
    'public_web_url' => env('PALVERSE_PUBLIC_WEB_URL', 'http://localhost:3000'),

    /*
    |--------------------------------------------------------------------------
    | Auth / Password Recovery Configuration
    |--------------------------------------------------------------------------
    */
    'auth' => [
        // URL on the frontend where the reset-password page lives.
        // The reset token and email are appended as query parameters.
        // Example: http://localhost:3000/reset-password?token=xxx&email=user@example.com
        'frontend_reset_password_url' => env(
            'PALVERSE_FRONTEND_RESET_PASSWORD_URL',
            'http://localhost:3000/reset-password'
        ),
    ],

    'qr' => [
        'default_size' => (int) env('QR_DEFAULT_SIZE', 512),
        'min_size' => (int) env('QR_MIN_SIZE', 128),
        'max_size' => (int) env('QR_MAX_SIZE', 1024),
        'default_format' => env('QR_DEFAULT_FORMAT', 'svg'),
        'error_correction' => env('QR_ERROR_CORRECTION', 'L'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Dashboard Configuration
    |--------------------------------------------------------------------------
    */
    'dashboard' => [
        'max_custom_range_days' => (int) env('DASHBOARD_MAX_CUSTOM_RANGE_DAYS', 366),
        'recent_activity_default_limit' => 10,
        'recent_activity_max_limit' => 50,
        'breakdown_default_limit' => 10,
        'breakdown_max_limit' => 50,
    ],

    /*
    |--------------------------------------------------------------------------
    | Search Configuration
    |--------------------------------------------------------------------------
    */
    'search' => [
        'max_query_length' => (int) env('SEARCH_MAX_QUERY_LENGTH', 100),
        'min_query_length_suggestions' => (int) env('SEARCH_MIN_QUERY_LENGTH_SUGGESTIONS', 2),
        'default_limit' => (int) env('SEARCH_DEFAULT_LIMIT', 20),
        'max_limit' => (int) env('SEARCH_MAX_LIMIT', 100),
        'suggestions_default_limit' => 8,
        'suggestions_max_limit' => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Settings Configuration
    |--------------------------------------------------------------------------
    */
    'settings' => [
        'whitelisted_keys' => [
            'general' => [
                'platform_name_ar',
                'platform_name_en',
                'platform_description_ar',
                'platform_description_en',
                'default_currency',
                'default_language',
                'supported_languages',
                'timezone',
            ],
            'branding' => [
                'logo_url',
                'logo_dark_url',
                'favicon_url',
                'primary_color',
                'secondary_color',
            ],
            'contact' => [
                'support_email',
                'support_phone',
                'support_whatsapp',
                'address_ar',
                'address_en',
            ],
            'social' => [
                'facebook_url',
                'instagram_url',
                'tiktok_url',
                'linkedin_url',
                'youtube_url',
                'x_url',
            ],
            'application' => [
                'android_app_url',
                'ios_app_url',
                'minimum_android_version',
                'minimum_ios_version',
            ],
            'maintenance' => [
                'maintenance_message_ar',
                'maintenance_message_en',
                'registration_enabled',
                'merchant_registration_enabled',
            ],
        ],
    ],
];
