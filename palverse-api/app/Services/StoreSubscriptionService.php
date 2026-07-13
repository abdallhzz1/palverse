<?php

namespace App\Services;

use App\Enums\SubscriptionStatus;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\SubscriptionAssignedNotification;
use App\Notifications\SubscriptionCancelledNotification;
use App\Notifications\SubscriptionExpiredNotification;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

class StoreSubscriptionService
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function assignSubscription(Store $store, SubscriptionPlan $plan, User $assignedBy, ?\DateTimeInterface $startsAt = null, ?\DateTimeInterface $endsAt = null, ?string $notes = null): StoreSubscription
    {
        if (! $plan->is_active) {
            $this->abort(409, 'SUBSCRIPTION_PLAN_INACTIVE', 'The selected subscription plan is inactive.');
        }

        return DB::transaction(function () use ($store, $plan, $assignedBy, $startsAt, $endsAt, $notes) {
            $store->refresh();

            // Lock the active subscriptions for this store to prevent race conditions
            $currentActive = StoreSubscription::where('store_id', $store->id)
                ->where('status', SubscriptionStatus::ACTIVE->value)
                ->lockForUpdate()
                ->first();

            if ($currentActive) {
                $this->abort(409, 'STORE_ALREADY_HAS_ACTIVE_SUBSCRIPTION', 'This store already has an active subscription.');
            }

            $startsAt = $startsAt ?? now();
            $endsAt = $endsAt ?? $startsAt->copy()->addDays($plan->duration_days);

            if ($endsAt <= $startsAt) {
                $this->abort(422, 'SUBSCRIPTION_INVALID_DATE_RANGE', 'The end date must be after the start date.');
            }

            $subscription = StoreSubscription::create([
                'store_id' => $store->id,
                'subscription_plan_id' => $plan->id,
                'status' => SubscriptionStatus::ACTIVE->value,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'activated_at' => now(), // Manual MVP flow activates immediately
                'assigned_by' => $assignedBy->id,
                'notes' => $notes,
                'price_snapshot' => $plan->price,
                'currency_snapshot' => $plan->currency,
                'plan_name_ar_snapshot' => $plan->name_ar,
                'plan_name_en_snapshot' => $plan->name_en,
            ]);

            $this->notificationService->send($store->owner, new SubscriptionAssignedNotification($subscription));

            return $subscription;
        });
    }

    public function cancelSubscription(StoreSubscription $subscription, User $cancelledBy, string $reason): StoreSubscription
    {
        if (! in_array($subscription->status, [SubscriptionStatus::PENDING, SubscriptionStatus::ACTIVE])) {
            $this->abort(409, 'SUBSCRIPTION_INVALID_STATUS_TRANSITION', 'Only pending or active subscriptions can be cancelled.');
        }

        return DB::transaction(function () use ($subscription, $cancelledBy, $reason) {
            $subscription->update([
                'status' => SubscriptionStatus::CANCELLED->value,
                'cancelled_at' => now(),
                'cancelled_by' => $cancelledBy->id,
                'cancellation_reason' => $reason,
            ]);

            $this->notificationService->send($subscription->store->owner, new SubscriptionCancelledNotification($subscription));

            return $subscription;
        });
    }

    public function expireSubscription(StoreSubscription $subscription): StoreSubscription
    {
        if ($subscription->status !== SubscriptionStatus::ACTIVE) {
            $this->abort(409, 'SUBSCRIPTION_NOT_ACTIVE', 'Only active subscriptions can be expired.');
        }

        if ($subscription->ends_at > now()) {
            $this->abort(409, 'SUBSCRIPTION_INVALID_STATUS_TRANSITION', 'This subscription has not yet reached its end date.');
        }

        return DB::transaction(function () use ($subscription) {
            $subscription->update([
                'status' => SubscriptionStatus::EXPIRED->value,
                'expired_at' => now(),
            ]);

            $notification = new SubscriptionExpiredNotification($subscription);
            // Use the notification's metadata event key for deduplication
            $this->notificationService->send($subscription->store->owner, $notification, $notification->toArray($subscription->store->owner)['metadata']['event_key']);

            return $subscription;
        });
    }

    public function expireOutdatedSubscriptions(): int
    {
        $count = 0;

        StoreSubscription::with('store.owner')->where('status', SubscriptionStatus::ACTIVE->value)
            ->where('ends_at', '<', now())
            ->chunkById(100, function ($subscriptions) use (&$count) {
                foreach ($subscriptions as $subscription) {
                    $subscription->update([
                        'status' => SubscriptionStatus::EXPIRED->value,
                        'expired_at' => now(),
                    ]);

                    $notification = new SubscriptionExpiredNotification($subscription);
                    $this->notificationService->send($subscription->store->owner, $notification, $notification->toArray($subscription->store->owner)['metadata']['event_key']);

                    $count++;
                }
            });

        return $count;
    }

    private function abort(int $status, string $errorCode, string $message): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $message,
            'error' => [
                'code' => $errorCode,
                'details' => [],
            ],
            'meta' => [],
        ], $status));
    }
}
