<?php

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Offer;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\User;
use App\Support\DashboardDateRange;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MerchantDashboardService
{
    /**
     * Get merchant dashboard summary metrics scoped to owned stores.
     */
    public function getSummary(User $merchant, DashboardDateRange $range): array
    {
        $now = Carbon::now();
        $thresholdDays = config('palverse.notifications.subscription_expiring_days', 7);
        $expiringSoonLimit = $now->copy()->addDays($thresholdDays);

        $storeIds = Store::where('owner_id', $merchant->id)->pluck('id');

        // Stores
        $storesCount = [
            'total_stores' => Store::where('owner_id', $merchant->id)->count(),
            'pending_stores' => Store::where('owner_id', $merchant->id)->where('status', StoreStatus::PENDING->value)->count(),
            'approved_stores' => Store::where('owner_id', $merchant->id)->where('status', StoreStatus::APPROVED->value)->count(),
            'rejected_stores' => Store::where('owner_id', $merchant->id)->where('status', StoreStatus::REJECTED->value)->count(),
            'active_stores' => Store::where('owner_id', $merchant->id)->where('is_active', true)->count(),
            'publicly_visible_stores' => Store::where('owner_id', $merchant->id)->publicVisible()->count(),
            'stores_needing_subscription' => Store::where('owner_id', $merchant->id)
                ->where('status', StoreStatus::APPROVED->value)
                ->whereDoesntHave('currentSubscription')
                ->count(),
            'new_stores_in_period' => Store::where('owner_id', $merchant->id)
                ->whereBetween('created_at', [$range->from, $range->to])
                ->count(),
        ];

        // Subscriptions
        $subscriptionsCount = [
            'active_subscriptions' => StoreSubscription::whereIn('store_id', $storeIds)
                ->where('status', SubscriptionStatus::ACTIVE->value)
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now)
                ->count(),
            'expiring_soon_subscriptions' => StoreSubscription::whereIn('store_id', $storeIds)
                ->where('status', SubscriptionStatus::ACTIVE->value)
                ->where('starts_at', '<=', $now)
                ->whereBetween('ends_at', [$now, $expiringSoonLimit])
                ->count(),
            'expired_subscriptions' => StoreSubscription::whereIn('store_id', $storeIds)
                ->where(function ($q) use ($now) {
                    $q->where('status', SubscriptionStatus::EXPIRED->value)
                        ->orWhere(function ($sq) use ($now) {
                            $sq->where('status', SubscriptionStatus::ACTIVE->value)
                                ->where('ends_at', '<', $now);
                        });
                })
                ->count(),
            'cancelled_subscriptions' => StoreSubscription::whereIn('store_id', $storeIds)
                ->where('status', SubscriptionStatus::CANCELLED->value)
                ->count(),
        ];

        // Offers
        $offersCount = [
            'total_offers' => Offer::whereIn('store_id', $storeIds)->count(),
            'active_offers' => Offer::whereIn('store_id', $storeIds)->where('is_active', true)->count(),
            'currently_valid_offers' => Offer::whereIn('store_id', $storeIds)
                ->where('is_active', true)
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now)
                ->count(),
            'expired_offers' => Offer::whereIn('store_id', $storeIds)->where('ends_at', '<', $now)->count(),
            'scheduled_offers' => Offer::whereIn('store_id', $storeIds)->where('starts_at', '>', $now)->count(),
            'offers_created_in_period' => Offer::whereIn('store_id', $storeIds)
                ->whereBetween('created_at', [$range->from, $range->to])
                ->count(),
        ];

        // Notifications
        $unreadNotifications = DB::table('notifications')
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $merchant->id)
            ->whereNull('read_at')
            ->count();

        // Action required
        $actionRequired = [
            'rejected_stores' => $storesCount['rejected_stores'],
            'stores_without_active_subscription' => $storesCount['stores_needing_subscription'],
            'subscriptions_expiring_soon' => $subscriptionsCount['expiring_soon_subscriptions'],
            'expired_subscriptions' => $subscriptionsCount['expired_subscriptions'],
            'stores_missing_logo' => Store::where('owner_id', $merchant->id)->whereDoesntHave('logo')->count(),
            'stores_missing_cover' => Store::where('owner_id', $merchant->id)->whereDoesntHave('cover')->count(),
            'stores_without_working_hours' => Store::where('owner_id', $merchant->id)->whereDoesntHave('workingHours')->count(),
            'stores_without_social_links' => Store::where('owner_id', $merchant->id)->whereDoesntHave('socialLinks')->count(),
        ];

        return [
            'stores' => $storesCount,
            'subscriptions' => $subscriptionsCount,
            'offers' => $offersCount,
            'notifications' => [
                'unread_notifications' => $unreadNotifications,
            ],
            'action_required' => $actionRequired,
        ];
    }

    /**
     * Get recent activities scoped strictly to the authenticated merchant.
     */
    public function getRecentActivity(User $merchant, int $limit = 10): array
    {
        $now = Carbon::now();
        $storeIds = Store::where('owner_id', $merchant->id)->pluck('id');

        $recentStores = Store::where('owner_id', $merchant->id)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($s) => [
                'public_id' => $s->public_id,
                'name_ar' => $s->name_ar,
                'name_en' => $s->name_en,
                'status' => $s->status->value,
                'created_at' => $s->created_at->toIso8601String(),
            ]);

        $recentOffers = Offer::whereIn('store_id', $storeIds)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($o) => [
                'public_id' => $o->public_id,
                'title_ar' => $o->title_ar,
                'title_en' => $o->title_en,
                'is_active' => $o->is_active,
                'created_at' => $o->created_at->toIso8601String(),
            ]);

        $recentSubscriptions = StoreSubscription::with('plan')
            ->whereIn('store_id', $storeIds)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($sub) => [
                'public_id' => $sub->public_id,
                'plan_name' => $sub->plan ? $sub->plan->name_ar : null,
                'status' => $sub->status->value,
                'starts_at' => $sub->starts_at->toIso8601String(),
                'ends_at' => $sub->ends_at->toIso8601String(),
                'created_at' => $sub->created_at->toIso8601String(),
            ]);

        $recentNotifications = DB::table('notifications')
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $merchant->id)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'data' => json_decode($n->data, true),
                'read_at' => $n->read_at ? Carbon::parse($n->read_at)->toIso8601String() : null,
                'created_at' => Carbon::parse($n->created_at)->toIso8601String(),
            ]);

        return [
            'recent_stores' => $recentStores,
            'recent_offers' => $recentOffers,
            'recent_subscriptions' => $recentSubscriptions,
            'recent_notifications' => $recentNotifications,
        ];
    }
}
