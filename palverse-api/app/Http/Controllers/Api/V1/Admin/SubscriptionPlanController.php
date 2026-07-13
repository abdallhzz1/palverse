<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminSubscriptionPlanIndexRequest;
use App\Http\Requests\Api\V1\Admin\StoreSubscriptionPlanRequest;
use App\Http\Requests\Api\V1\Admin\UpdateSubscriptionPlanRequest;
use App\Http\Resources\Api\V1\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;

class SubscriptionPlanController extends Controller
{
    public function index(AdminSubscriptionPlanIndexRequest $request): JsonResponse
    {
        $this->authorize('viewAny', SubscriptionPlan::class);

        $query = SubscriptionPlan::query();

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('name_ar', 'like', "%{$q}%")
                    ->orWhere('name_en', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        $plans = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Subscription plans retrieved successfully.',
            'data' => SubscriptionPlanResource::collection($plans)->response()->getData(true)['data'],
            'meta' => SubscriptionPlanResource::collection($plans)->response()->getData(true)['meta'],
        ]);
    }

    public function store(StoreSubscriptionPlanRequest $request): JsonResponse
    {
        $this->authorize('create', SubscriptionPlan::class);

        $plan = SubscriptionPlan::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan created successfully.',
            'data' => new SubscriptionPlanResource($plan),
            'meta' => [],
        ], 201);
    }

    public function show(string $publicId): JsonResponse
    {
        $this->authorize('view', SubscriptionPlan::class);

        $plan = SubscriptionPlan::where('public_id', $publicId)->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan retrieved successfully.',
            'data' => new SubscriptionPlanResource($plan),
            'meta' => [],
        ]);
    }

    public function update(UpdateSubscriptionPlanRequest $request, string $publicId): JsonResponse
    {
        $this->authorize('update', SubscriptionPlan::class);

        $plan = SubscriptionPlan::where('public_id', $publicId)->firstOrFail();
        $plan->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan updated successfully.',
            'data' => new SubscriptionPlanResource($plan->fresh()),
            'meta' => [],
        ]);
    }

    public function destroy(string $publicId): JsonResponse
    {
        $this->authorize('delete', SubscriptionPlan::class);

        $plan = SubscriptionPlan::where('public_id', $publicId)->firstOrFail();
        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscription plan deleted successfully.',
            'data' => [],
            'meta' => [],
        ]);
    }
}
