<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DashboardStatsRequest;
use App\Services\AdminDashboardService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    protected AdminDashboardService $dashboardService;

    public function __construct(AdminDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get admin summary stats.
     */
    public function summary(DashboardStatsRequest $request): JsonResponse
    {
        $range = $request->dateRange();
        $data = $this->dashboardService->getSummary($range);

        return response()->json([
            'success' => true,
            'message' => __('Admin dashboard summary retrieved successfully.'),
            'data' => $data,
            'meta' => $range->toArray(),
        ]);
    }

    /**
     * Get recent activities.
     */
    public function recentActivity(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $limit = (int) $request->input('limit', config('palverse.dashboard.recent_activity_default_limit', 10));
        $data = $this->dashboardService->getRecentActivity($limit);

        return response()->json([
            'success' => true,
            'message' => __('Recent activity retrieved successfully.'),
            'data' => $data,
            'meta' => [
                'limit' => $limit,
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Stores by status breakdown.
     */
    public function storesByStatus(DashboardStatsRequest $request): JsonResponse
    {
        $range = $request->dateRange();
        $data = $this->dashboardService->getStoresByStatus();

        return response()->json([
            'success' => true,
            'message' => __('Stores by status breakdown retrieved successfully.'),
            'data' => $data,
            'meta' => $range->toArray(),
        ]);
    }

    /**
     * Subscriptions by status breakdown.
     */
    public function subscriptionsByStatus(DashboardStatsRequest $request): JsonResponse
    {
        $range = $request->dateRange();
        $data = $this->dashboardService->getSubscriptionsByStatus();

        return response()->json([
            'success' => true,
            'message' => __('Subscriptions by status breakdown retrieved successfully.'),
            'data' => $data,
            'meta' => $range->toArray(),
        ]);
    }

    /**
     * Stores by category breakdown.
     */
    public function storesByCategory(DashboardStatsRequest $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $range = $request->dateRange();
        $limit = (int) $request->input('limit', config('palverse.dashboard.breakdown_default_limit', 10));
        $data = $this->dashboardService->getStoresByCategory($limit);

        return response()->json([
            'success' => true,
            'message' => __('Stores by category breakdown retrieved successfully.'),
            'data' => $data,
            'meta' => array_merge($range->toArray(), ['limit' => $limit]),
        ]);
    }

    /**
     * Stores by city breakdown.
     */
    public function storesByCity(DashboardStatsRequest $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $range = $request->dateRange();
        $limit = (int) $request->input('limit', config('palverse.dashboard.breakdown_default_limit', 10));
        $data = $this->dashboardService->getStoresByCity($limit);

        return response()->json([
            'success' => true,
            'message' => __('Stores by city breakdown retrieved successfully.'),
            'data' => $data,
            'meta' => array_merge($range->toArray(), ['limit' => $limit]),
        ]);
    }

    /**
     * Subscriptions by plan breakdown.
     */
    public function subscriptionsByPlan(DashboardStatsRequest $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $range = $request->dateRange();
        $limit = (int) $request->input('limit', config('palverse.dashboard.breakdown_default_limit', 10));
        $data = $this->dashboardService->getSubscriptionsByPlan($limit);

        return response()->json([
            'success' => true,
            'message' => __('Subscriptions by plan breakdown retrieved successfully.'),
            'data' => $data,
            'meta' => array_merge($range->toArray(), ['limit' => $limit]),
        ]);
    }

    /**
     * Get metric trends.
     */
    public function trends(DashboardStatsRequest $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'metric' => ['required', 'string', 'in:stores,subscriptions,offers,users'],
            'grouping' => ['required', 'string', 'in:day,week,month'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $range = $request->dateRange();
        $metric = $request->input('metric');
        $grouping = $request->input('grouping');

        $data = $this->dashboardService->getTrends($metric, $grouping, $range->from, $range->to);

        return response()->json([
            'success' => true,
            'message' => __('Trends retrieved successfully.'),
            'data' => $data,
            'meta' => array_merge($range->toArray(), [
                'metric' => $metric,
                'grouping' => $grouping,
            ]),
        ]);
    }
}
