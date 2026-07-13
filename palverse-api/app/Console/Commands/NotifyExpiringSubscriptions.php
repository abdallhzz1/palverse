<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\StoreSubscription;
use App\Notifications\SubscriptionExpiringSoonNotification;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class NotifyExpiringSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:notify-expiring {--days=7 : Number of days before expiration to send the notification}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify store owners of subscriptions expiring within the specified days';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService)
    {
        $days = (int) $this->option('days');

        if ($days <= 0) {
            $this->error('The --days option must be a positive integer.');

            return 1;
        }

        $thresholdDate = now()->addDays($days);

        $this->info("Scanning for subscriptions expiring before: {$thresholdDate}");

        $query = StoreSubscription::with('store.owner')
            ->where('status', SubscriptionStatus::ACTIVE->value)
            ->where('ends_at', '<=', $thresholdDate)
            ->where('ends_at', '>', now()); // Avoid those already expired

        $scannedCount = 0;
        $notifiedCount = 0;
        $skippedCount = 0;

        $query->chunkById(100, function ($subscriptions) use ($days, $notificationService, &$scannedCount, &$notifiedCount, &$skippedCount) {
            foreach ($subscriptions as $subscription) {
                $scannedCount++;

                $notification = new SubscriptionExpiringSoonNotification($subscription, $days);
                $eventKey = $notification->toArray($subscription->store->owner)['metadata']['event_key'];

                $sent = $notificationService->send($subscription->store->owner, $notification, $eventKey);

                if ($sent) {
                    $notifiedCount++;
                } else {
                    $skippedCount++;
                }
            }
        });

        $this->info("Completed. Scanned: {$scannedCount}, Notified: {$notifiedCount}, Skipped (Duplicates): {$skippedCount}");

        return 0;
    }
}
