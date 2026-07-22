<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$store = App\Models\Store::publicVisible()
    ->whereHas('advertisements', function ($q) {
        $q->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString());
    })
    ->first();

if ($store) {
    echo "FEATURED STORE SLUG: " . $store->slug . "\n";
}

$slugs = App\Models\Store::publicVisible()->pluck('slug');
foreach ($slugs as $s) {
    if (strpos($s, '%') !== false) {
        echo "URL ENCODED SLUG FOUND: " . $s . "\n";
    }
}
echo "ALL SLUGS:\n";
foreach ($slugs as $s) {
    echo "- " . $s . "\n";
}
