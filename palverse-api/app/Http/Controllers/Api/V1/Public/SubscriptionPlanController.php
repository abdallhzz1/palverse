<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;

class SubscriptionPlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Subscription plans retrieved successfully.',
            'data' => SubscriptionPlanResource::collection($plans),
            'meta' => [],
        ]);
    }

    public function show(string $code): JsonResponse
    {
        $plan = SubscriptionPlan::active()
            ->where('code', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan retrieved successfully.',
            'data' => new SubscriptionPlanResource($plan),
            'meta' => [],
        ]);
    }
}
