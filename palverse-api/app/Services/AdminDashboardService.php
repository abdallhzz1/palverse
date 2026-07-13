<?php

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Enums\UserStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Offer;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use App\Support\DashboardDateRange;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /**
     * Get admin dashboard summary counts.
     */
    public function getSummary(DashboardDateRange $range): array
    {
        $now = Carbon::now();
        $thresholdDays = config('palverse.notifications.subscription_expiring_days', 7);
        $expiringSoonLimit = $now->copy()->addDays($thresholdDays);

        // Users
        $usersCount = [
            'total_users' => User::count(),
            'active_users' => User::where('status', UserStatus::Active->value)->count(),
            'inactive_users' => User::where('status', UserStatus::Inactive->value)->count(),
            'suspended_users' => User::where('status', UserStatus::Suspended->value)->count(),
            'total_merchants' => User::role('merchant')->count(),
            'new_users_in_period' => User::whereBetween('created_at', [$range->from, $range->to])->count(),
        ];

        // Stores
        $storesCount = [
            'total_stores' => Store::count(),
            'pending_stores' => Store::where('status', StoreStatus::PENDING->value)->count(),
            'approved_stores' => Store::where('status', StoreStatus::APPROVED->value)->count(),
            'rejected_stores' => Store::where('status', StoreStatus::REJECTED->value)->count(),
            'active_stores' => Store::where('is_active', true)->count(),
            'inactive_stores' => Store::where('is_active', false)->count(),
            'publicly_visible_stores' => Store::publicVisible()->count(),
            'stores_without_active_subscription' => Store::whereDoesntHave('currentSubscription')->count(),
            'new_stores_in_period' => Store::whereBetween('created_at', [$range->from, $range->to])->count(),
        ];

        // Subscriptions
        $subscriptionsCount = [
            'total_subscriptions' => StoreSubscription::count(),
            'active_subscriptions' => StoreSubscription::where('status', SubscriptionStatus::ACTIVE->value)
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now)
                ->count(),
            'pending_subscriptions' => StoreSubscription::where('status', SubscriptionStatus::PENDING->value)->count(),
            'expired_subscriptions' => StoreSubscription::where('status', SubscriptionStatus::EXPIRED->value)
                ->orWhere(function ($q) use ($now) {
                    $q->where('status', SubscriptionStatus::ACTIVE->value)
                        ->where('ends_at', '<', $now);
                })
                ->count(),
            'cancelled_subscriptions' => StoreSubscription::where('status', SubscriptionStatus::CANCELLED->value)->count(),
            'subscriptions_expiring_soon' => StoreSubscription::where('status', SubscriptionStatus::ACTIVE->value)
                ->where('starts_at', '<=', $now)
                ->whereBetween('ends_at', [$now, $expiringSoonLimit])
                ->count(),
            'subscriptions_started_in_period' => StoreSubscription::whereBetween('starts_at', [$range->from, $range->to])->count(),
            'subscriptions_ended_in_period' => StoreSubscription::whereBetween('ends_at', [$range->from, $range->to])->count(),
        ];

        // Offers
        $offersCount = [
            'total_offers' => Offer::count(),
            'active_offers' => Offer::where('is_active', true)->count(),
            'inactive_offers' => Offer::where('is_active', false)->count(),
            'currently_valid_offers' => Offer::where('is_active', true)
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now)
                ->count(),
            'expired_offers' => Offer::where('ends_at', '<', $now)->count(),
            'scheduled_offers' => Offer::where('starts_at', '>', $now)->count(),
            'offers_created_in_period' => Offer::whereBetween('created_at', [$range->from, $range->to])->count(),
        ];

        // Taxonomy
        $taxonomyCount = [
            'active_categories' => Category::count(),
            'active_cities' => City::count(),
            'active_zones' => Zone::count(),
        ];

        // Notifications
        $notificationsCount = [
            'total_notifications_in_period' => DB::table('notifications')->whereBetween('created_at', [$range->from, $range->to])->count(),
            'unread_notifications_total' => DB::table('notifications')->whereNull('read_at')->count(),
            'notifications_sent_in_period' => DB::table('notifications')->whereBetween('created_at', [$range->from, $range->to])->count(),
        ];

        return [
            'users' => $usersCount,
            'stores' => $storesCount,
            'subscriptions' => $subscriptionsCount,
            'offers' => $offersCount,
            'taxonomy' => $taxonomyCount,
            'notifications' => $notificationsCount,
        ];
    }

    /**
     * Get recent activities for various dashboard entities.
     */
    public function getRecentActivity(int $limit = 10): array
    {
        $now = Carbon::now();

        $recentStores = Store::with('owner')->latest()->limit($limit)->get()->map(fn ($s) => [
            'public_id' => $s->public_id,
            'name_ar' => $s->name_ar,
            'name_en' => $s->name_en,
            'status' => $s->status->value,
            'created_at' => $s->created_at->toIso8601String(),
            'owner_name' => $s->owner ? $s->owner->name : null,
        ]);

        $recentPendingStores = Store::with('owner')->pending()->latest()->limit($limit)->get()->map(fn ($s) => [
            'public_id' => $s->public_id,
            'name_ar' => $s->name_ar,
            'name_en' => $s->name_en,
            'created_at' => $s->created_at->toIso8601String(),
            'owner_name' => $s->owner ? $s->owner->name : null,
        ]);

        $recentSubAssignments = StoreSubscription::with(['store', 'assignedBy', 'plan'])
            ->where('status', SubscriptionStatus::ACTIVE->value)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($sub) => [
                'public_id' => $sub->public_id,
                'store_name' => $sub->store ? $sub->store->name_ar : null,
                'plan_name' => $sub->plan ? $sub->plan->name_ar : null,
                'assigned_by' => $sub->assignedBy ? $sub->assignedBy->name : null,
                'starts_at' => $sub->starts_at->toIso8601String(),
                'created_at' => $sub->created_at->toIso8601String(),
            ]);

        $recentSubCancellations = StoreSubscription::with(['store', 'cancelledBy', 'plan'])
            ->where('status', SubscriptionStatus::CANCELLED->value)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($sub) => [
                'public_id' => $sub->public_id,
                'store_name' => $sub->store ? $sub->store->name_ar : null,
                'plan_name' => $sub->plan ? $sub->plan->name_ar : null,
                'cancelled_by' => $sub->cancelledBy ? $sub->cancelledBy->name : null,
                'cancelled_at' => $sub->cancelled_at ? $sub->cancelled_at->toIso8601String() : null,
                'reason' => $sub->cancellation_reason,
            ]);

        $recentOffers = Offer::with('store')->latest()->limit($limit)->get()->map(fn ($o) => [
            'public_id' => $o->public_id,
            'title_ar' => $o->title_ar,
            'title_en' => $o->title_en,
            'store_name' => $o->store ? $o->store->name_ar : null,
            'is_active' => $o->is_active,
            'created_at' => $o->created_at->toIso8601String(),
        ]);

        $recentlyExpired = StoreSubscription::with(['store', 'plan'])
            ->where('status', SubscriptionStatus::EXPIRED->value)
            ->orWhere(function ($q) use ($now) {
                $q->where('status', SubscriptionStatus::ACTIVE->value)
                    ->where('ends_at', '<', $now);
            })
            ->orderBy('ends_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($sub) => [
                'public_id' => $sub->public_id,
                'store_name' => $sub->store ? $sub->store->name_ar : null,
                'plan_name' => $sub->plan ? $sub->plan->name_ar : null,
                'ends_at' => $sub->ends_at->toIso8601String(),
            ]);

        return [
            'recent_stores' => $recentStores,
            'recent_pending_stores' => $recentPendingStores,
            'recent_subscription_assignments' => $recentSubAssignments,
            'recent_subscription_cancellations' => $recentSubCancellations,
            'recent_offers' => $recentOffers,
            'recently_expired_subscriptions' => $recentlyExpired,
        ];
    }

    /**
     * Get cron-agnostic database trend groupings with zero-filled periods.
     */
    public function getTrends(string $metric, string $grouping, Carbon $from, Carbon $to): array
    {
        $query = match ($metric) {
            'stores' => Store::query(),
            'subscriptions' => StoreSubscription::query(),
            'offers' => Offer::query(),
            'users' => User::query(),
        };

        $query->whereBetween('created_at', [$from, $to]);
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $dateField = match ($grouping) {
                'day' => "strftime('%Y-%m-%d', created_at)",
                'week' => "strftime('%Y-W%W', created_at)",
                'month' => "strftime('%Y-%m', created_at)",
            };
        } else {
            $dateField = match ($grouping) {
                'day' => "DATE_FORMAT(created_at, '%Y-%m-%d')",
                'week' => "DATE_FORMAT(created_at, '%Y-W%v')",
                'month' => "DATE_FORMAT(created_at, '%Y-%m')",
            };
        }

        $results = $query->select(
            DB::raw("{$dateField} as period"),
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('period')
            ->orderBy('period', 'asc')
            ->get()
            ->pluck('count', 'period')
            ->toArray();

        $trends = [];
        $current = $from->copy();

        while ($current->lessThanOrEqualTo($to)) {
            $periodKey = match ($grouping) {
                'day' => $current->format('Y-m-d'),
                'week' => $current->format('Y-\WW'),
                'month' => $current->format('Y-m'),
            };

            $trends[$periodKey] = [
                'period' => $periodKey,
                'count' => $results[$periodKey] ?? 0,
            ];

            if ($grouping === 'day') {
                $current->addDay();
            } elseif ($grouping === 'week') {
                $current->addWeek();
            } else {
                $current->addMonth();
            }
        }

        return array_values($trends);
    }

    /**
     * Get store count grouped by status.
     */
    public function getStoresByStatus(): array
    {
        $results = Store::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $labels = [
            'pending' => ['ar' => 'قيد الانتظار', 'en' => 'Pending'],
            'approved' => ['ar' => 'معتمد', 'en' => 'Approved'],
            'rejected' => ['ar' => 'مرفوض', 'en' => 'Rejected'],
        ];

        return $results->map(function ($row) use ($labels) {
            $status = $row->status->value;

            return [
                'key' => $status,
                'label_ar' => $labels[$status]['ar'] ?? $status,
                'label_en' => $labels[$status]['en'] ?? $status,
                'count' => $row->count,
            ];
        })->sortByDesc('count')->values()->toArray();
    }

    /**
     * Get subscription count grouped by status.
     */
    public function getSubscriptionsByStatus(): array
    {
        $results = StoreSubscription::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $labels = [
            'pending' => ['ar' => 'قيد الانتظار', 'en' => 'Pending'],
            'active' => ['ar' => 'نشط', 'en' => 'Active'],
            'expired' => ['ar' => 'منتهي', 'en' => 'Expired'],
            'cancelled' => ['ar' => 'ملغي', 'en' => 'Cancelled'],
        ];

        return $results->map(function ($row) use ($labels) {
            $status = $row->status->value;

            return [
                'key' => $status,
                'label_ar' => $labels[$status]['ar'] ?? $status,
                'label_en' => $labels[$status]['en'] ?? $status,
                'count' => $row->count,
            ];
        })->sortByDesc('count')->values()->toArray();
    }

    /**
     * Get store count grouped by category.
     */
    public function getStoresByCategory(int $limit = 10): array
    {
        $results = Store::select('category_id', DB::raw('count(*) as count'))
            ->groupBy('category_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        $categoryIds = $results->pluck('category_id')->filter();
        $categories = Category::whereIn('id', $categoryIds)->get()->keyBy('id');

        return $results->map(function ($row) use ($categories) {
            $cat = $categories->get($row->category_id);

            return [
                'key' => $cat ? $cat->public_id : 'unknown',
                'label_ar' => $cat ? $cat->name_ar : 'غير معروف',
                'label_en' => $cat ? $cat->name_en : 'Unknown',
                'count' => $row->count,
            ];
        })->toArray();
    }

    /**
     * Get store count grouped by city.
     */
    public function getStoresByCity(int $limit = 10): array
    {
        $results = Store::select('city_id', DB::raw('count(*) as count'))
            ->groupBy('city_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        $cityIds = $results->pluck('city_id')->filter();
        $cities = City::whereIn('id', $cityIds)->get()->keyBy('id');

        return $results->map(function ($row) use ($cities) {
            $city = $cities->get($row->city_id);

            return [
                'key' => $city ? $city->public_id : 'unknown',
                'label_ar' => $city ? $city->name_ar : 'غير معروف',
                'label_en' => $city ? $city->name_en : 'Unknown',
                'count' => $row->count,
            ];
        })->toArray();
    }

    /**
     * Get subscription count grouped by subscription plan.
     */
    public function getSubscriptionsByPlan(int $limit = 10): array
    {
        $results = StoreSubscription::select('subscription_plan_id', DB::raw('count(*) as count'))
            ->groupBy('subscription_plan_id')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        $planIds = $results->pluck('subscription_plan_id')->filter();
        $plans = SubscriptionPlan::withTrashed()->whereIn('id', $planIds)->get()->keyBy('id');

        return $results->map(function ($row) use ($plans) {
            $plan = $plans->get($row->subscription_plan_id);

            return [
                'key' => $plan ? $plan->public_id : 'unknown',
                'label_ar' => $plan ? $plan->name_ar : 'غير معروف',
                'label_en' => $plan ? $plan->name_en : 'Unknown',
                'count' => $row->count,
            ];
        })->toArray();
    }
}
