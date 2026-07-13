<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminStoreSubscriptionIndexRequest;
use App\Http\Requests\Api\V1\Admin\AssignStoreSubscriptionRequest;
use App\Http\Requests\Api\V1\Admin\CancelStoreSubscriptionRequest;
use App\Http\Resources\Api\V1\StoreSubscriptionResource;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Services\StoreSubscriptionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class StoreSubscriptionController extends Controller
{
    public function index(AdminStoreSubscriptionIndexRequest $request): JsonResponse
    {
        $this->authorize('viewAny', StoreSubscription::class);

        $query = StoreSubscription::with(['plan', 'store', 'assignedBy', 'cancelledBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('store_public_id')) {
            $store = Store::where('public_id', $request->input('store_public_id'))->first();
            if ($store) {
                $query->where('store_id', $store->id);
            } else {
                $query->where('id', 0);
            }
        }

        if ($request->filled('plan_public_id')) {
            $plan = SubscriptionPlan::where('public_id', $request->input('plan_public_id'))->first();
            if ($plan) {
                $query->where('subscription_plan_id', $plan->id);
            } else {
                $query->where('id', 0);
            }
        }

        if ($request->filled('starts_from')) {
            $query->whereDate('starts_at', '>=', $request->input('starts_from'));
        }
        if ($request->filled('starts_to')) {
            $query->whereDate('starts_at', '<=', $request->input('starts_to'));
        }
        if ($request->filled('ends_from')) {
            $query->whereDate('ends_at', '>=', $request->input('ends_from'));
        }
        if ($request->filled('ends_to')) {
            $query->whereDate('ends_at', '<=', $request->input('ends_to'));
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        $subscriptions = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Store subscriptions retrieved successfully.',
            'data' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['data'],
            'meta' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['meta'],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $this->authorize('view', StoreSubscription::class);

        $subscription = StoreSubscription::with(['plan', 'store', 'assignedBy', 'cancelledBy'])
            ->where('public_id', $publicId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Store subscription retrieved successfully.',
            'data' => new StoreSubscriptionResource($subscription),
            'meta' => [],
        ]);
    }

    public function assign(AssignStoreSubscriptionRequest $request, StoreSubscriptionService $service): JsonResponse
    {
        $this->authorize('create', StoreSubscription::class);

        $store = Store::where('public_id', $request->input('store_public_id'))->firstOrFail();
        $plan = SubscriptionPlan::where('public_id', $request->input('subscription_plan_public_id'))->firstOrFail();

        $startsAt = $request->filled('starts_at') ? Carbon::parse($request->input('starts_at')) : null;
        $endsAt = $request->filled('ends_at') ? Carbon::parse($request->input('ends_at')) : null;

        $subscription = $service->assignSubscription(
            store: $store,
            plan: $plan,
            assignedBy: $request->user(),
            startsAt: $startsAt,
            endsAt: $endsAt,
            notes: $request->input('notes')
        );

        $subscription->load(['plan', 'store', 'assignedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Store subscription assigned successfully.',
            'data' => new StoreSubscriptionResource($subscription),
            'meta' => [],
        ], 201);
    }

    public function cancel(CancelStoreSubscriptionRequest $request, string $publicId, StoreSubscriptionService $service): JsonResponse
    {
        $this->authorize('update', StoreSubscription::class);

        $subscription = StoreSubscription::where('public_id', $publicId)->firstOrFail();

        $subscription = $service->cancelSubscription(
            subscription: $subscription,
            cancelledBy: $request->user(),
            reason: $request->input('cancellation_reason')
        );

        $subscription->load(['plan', 'store', 'assignedBy', 'cancelledBy']);

        return response()->json([
            'success' => true,
            'message' => 'Store subscription cancelled successfully.',
            'data' => new StoreSubscriptionResource($subscription),
            'meta' => [],
        ]);
    }

    public function storeSubscriptions(string $storePublicId): JsonResponse
    {
        $this->authorize('viewAny', StoreSubscription::class);

        $store = Store::where('public_id', $storePublicId)->firstOrFail();

        $subscriptions = $store->subscriptions()
            ->with(['plan', 'assignedBy', 'cancelledBy'])
            ->orderBy('starts_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Store subscriptions retrieved successfully.',
            'data' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['data'],
            'meta' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['meta'],
        ]);
    }
}
