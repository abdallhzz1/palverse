<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use App\Services\PublicReferenceCacheService;
use Illuminate\Http\JsonResponse;

class SubscriptionPlanController extends Controller
{
    public function __construct(protected PublicReferenceCacheService $cacheService) {}

    public function index(): JsonResponse
    {
        $data = $this->cacheService->remember('plans', [], function () {
            $plans = SubscriptionPlan::active()
                ->ordered()
                ->get();

            return SubscriptionPlanResource::collection($plans)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'Subscription plans retrieved successfully.',
            'data' => $data,
            'meta' => [],
        ]);
    }

    public function show(string $code): JsonResponse
    {
        $data = $this->cacheService->remember('plans', ['code' => $code], function () use ($code) {
            $plan = SubscriptionPlan::active()
                ->where('code', $code)
                ->firstOrFail();

            return (new SubscriptionPlanResource($plan))->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan retrieved successfully.',
            'data' => $data,
            'meta' => [],
        ]);
    }
}
