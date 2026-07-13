<?php

namespace App\Console\Commands;

use App\Services\StoreSubscriptionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

class ExpireStoreSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire store subscriptions that have passed their ends_at date';

    /**
     * Execute the console command.
     */
    public function handle(StoreSubscriptionService $service)
    {
        $this->info('Starting store subscription expiration process...');

        $expiredCount = $service->expireOutdatedSubscriptions();

        $this->info("Successfully expired {$expiredCount} store subscription(s).");
    }
}
