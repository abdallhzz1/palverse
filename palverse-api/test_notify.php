<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $joinRequest = \App\Models\MerchantJoinRequest::latest()->first();
    $admin = \App\Models\User::first();
    $notification = new \App\Notifications\NewJoinRequestNotification($joinRequest);
    $admin->notify($notification);
    echo "Success! DB count: " . \DB::table('notifications')->count() . PHP_EOL;
} catch (\Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . PHP_EOL;
}
