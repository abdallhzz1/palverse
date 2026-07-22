<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\StoreSubscriptionResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreSubscriptionController extends Controller
{
    public function show(string $storePublicId, Request $request): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->firstOrFail();

        // Merchant authorization
        if ($store->owner_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this store.',
                'error' => ['code' => 'UNAUTHORIZED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        $subscription = $store->currentSubscription ?? $store->latestSubscription;

        if ($subscription) {
            $subscription->load(['plan']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Store subscription retrieved successfully.',
            'data' => [
                'has_active_subscription' => $store->currentSubscription !== null,
                'public_visibility_allowed' => $store->currentSubscription !== null,
                'subscription' => $subscription ? new StoreSubscriptionResource($subscription) : null,
            ],
            'meta' => [],
        ]);
    }

    public function index(string $storePublicId, Request $request): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->firstOrFail();

        // Merchant authorization
        if ($store->owner_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this store.',
                'error' => ['code' => 'UNAUTHORIZED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        $subscriptions = $store->subscriptions()
            ->with(['plan'])
            ->orderBy('starts_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Store subscriptions retrieved successfully.',
            'data' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['data'],
            'meta' => StoreSubscriptionResource::collection($subscriptions)->response()->getData(true)['meta'],
        ]);
    }
}
