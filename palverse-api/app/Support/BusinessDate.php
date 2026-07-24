<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class BusinessDate
{
    /**
     * Calendar "today" for marketplace windows (ads, offers visibility by date).
     * Palestine local date — avoids UTC midnight mismatch with staff browsers.
     */
    public static function today(): string
    {
        return self::now()->toDateString();
    }

    public static function now(): Carbon
    {
        $timezone = (string) config('palverse.business_timezone', 'Asia/Hebron');

        return now($timezone);
    }
}
