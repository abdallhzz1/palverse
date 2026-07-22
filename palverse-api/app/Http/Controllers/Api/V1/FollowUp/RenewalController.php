<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\StoreSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RenewalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StoreSubscription::class);

        $now = now();
        $query = StoreSubscription::with(['store.owner', 'plan'])
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')
                  ->from('store_subscriptions')
                  ->whereNull('deleted_at')
                  ->groupBy('store_id');
            })
            ->where(function ($q) use ($now) {
                // Expired or expiring within 30 days
                $q->where('status', 'expired')
                  ->orWhere(function ($q2) use ($now) {
                      $q2->where('status', 'active')
                         ->where('ends_at', '<=', $now->copy()->addDays(30));
                  });
            });

        // Filter by state if provided
        if ($request->filled('status_filter')) {
            if ($request->status_filter === 'expired') {
                $query->where('status', 'expired')->orWhere('ends_at', '<', $now);
            } elseif ($request->status_filter === 'expiring_soon') {
                $query->where('status', 'active')->where('ends_at', '>=', $now);
            }
        }

        $subscriptions = $query->orderBy('ends_at', 'asc')->paginate();

        return response()->json([
            'success' => true,
            'data' => $subscriptions->items(),
            'meta' => [
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $subscription = StoreSubscription::where('public_id', $publicId)
            ->with(['store.owner', 'plan'])
            ->firstOrFail();

        $this->authorize('view', $subscription);

        return response()->json([
            'success' => true,
            'data' => $subscription,
        ]);
    }

    public function renew(Request $request, string $publicId): JsonResponse
    {
        $this->authorize('renew', StoreSubscription::class);

        $validated = $request->validate([
            'subscription_plan_id' => 'required|exists:subscription_plans,public_id',
        ]);

        $oldSubscription = StoreSubscription::where('public_id', $publicId)->firstOrFail();
        $plan = \App\Models\SubscriptionPlan::where('public_id', $validated['subscription_plan_id'])->firstOrFail();

        // Expire the old subscription if not already
        if ($oldSubscription->status !== \App\Enums\SubscriptionStatus::EXPIRED) {
            $oldSubscription->update([
                'status' => \App\Enums\SubscriptionStatus::EXPIRED->value,
                'expired_at' => now(),
            ]);
        }

        // Create new subscription
        $startsAt = $oldSubscription->ends_at > now() ? $oldSubscription->ends_at : now();
        $endsAt = $startsAt->copy()->addDays($plan->duration_days);

        \App\Models\StoreSubscription::create([
            'store_id' => $oldSubscription->store_id,
            'subscription_plan_id' => $plan->id,
            'status' => \App\Enums\SubscriptionStatus::ACTIVE->value,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'activated_at' => now(),
            'assigned_by' => $request->user()->id,
            'price_snapshot' => $plan->price,
            'currency_snapshot' => $plan->currency,
            'plan_name_ar_snapshot' => $plan->name_ar,
            'plan_name_en_snapshot' => $plan->name_en,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription renewed successfully',
        ]);
    }

    public function cancel(string $publicId): JsonResponse
    {
        $this->authorize('cancelFollowUp', StoreSubscription::class);

        $subscription = StoreSubscription::where('public_id', $publicId)->firstOrFail();
        
        $subscription->update([
            'status' => \App\Enums\SubscriptionStatus::CANCELLED->value,
            'cancelled_at' => now(),
            'cancelled_by' => request()->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully',
        ]);
    }
}
