<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\StoreSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnpaidSubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StoreSubscription::class);

        $subscriptions = StoreSubscription::with(['store.owner', 'plan'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate();

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

    public function pay(string $publicId): JsonResponse
    {
        $this->authorize('activateUnpaid', StoreSubscription::class);

        $subscription = StoreSubscription::where('public_id', $publicId)->firstOrFail();
        
        $subscription->update([
            'status' => \App\Enums\SubscriptionStatus::ACTIVE->value,
            'activated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully',
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
