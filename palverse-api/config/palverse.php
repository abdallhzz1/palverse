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
];
