<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DashboardStatsRequest;
use App\Models\Store;
use App\Services\MerchantDashboardService;
use App\Services\StoreLinkService;
use App\Services\StoreProfileCompletenessService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    protected MerchantDashboardService $dashboardService;

    protected StoreProfileCompletenessService $completenessService;

    protected StoreLinkService $linkService;

    public function __construct(
        MerchantDashboardService $dashboardService,
        StoreProfileCompletenessService $completenessService,
        StoreLinkService $linkService
    ) {
        $this->dashboardService = $dashboardService;
        $this->completenessService = $completenessService;
        $this->linkService = $linkService;
    }

    /**
     * Get merchant dashboard summary metrics.
     */
    public function summary(DashboardStatsRequest $request): JsonResponse
    {
        $merchant = $request->user();
        $range = $request->dateRange();
        $data = $this->dashboardService->getSummary($merchant, $range);

        return response()->json([
            'success' => true,
            'message' => __('Merchant dashboard summary retrieved successfully.'),
            'data' => $data,
            'meta' => $range->toArray(),
        ]);
    }

    /**
     * Get merchant recent activity.
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

        $merchant = $request->user();
        $limit = (int) $request->input('limit', config('palverse.dashboard.recent_activity_default_limit', 10));
        $data = $this->dashboardService->getRecentActivity($merchant, $limit);

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
     * Get store-level dashboard details.
     */
    public function storeDashboard(Request $request, string $storePublicId): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->first();

        if (! $store) {
            return response()->json([
                'success' => false,
                'message' => __('Store not found.'),
            ], 404);
        }

        // Authorize using the existing StorePolicy view capability
        if ($request->user()->cannot('view', $store)) {
            return response()->json([
                'success' => false,
                'message' => __('This action is unauthorized.'),
            ], 403);
        }

        $now = now();
        $isPublic = $store->isPubliclyVisible();

        // Store Links
        $webUrl = $store->slug ? $this->linkService->generateWebUrl($store) : null;
        $deepLink = $store->slug ? $this->linkService->generateDeepLink($store) : null;

        $storeStatus = [
            'public_id' => $store->public_id,
            'name_ar' => $store->name_ar,
            'name_en' => $store->name_en,
            'approval_status' => $store->status->value,
            'is_active' => $store->is_active,
            'is_publicly_visible' => $isPublic,
            'rejection_reason' => $store->status === StoreStatus::REJECTED ? $store->rejection_reason : null,
            'slug' => $store->slug,
            'web_url' => $webUrl,
            'deep_link' => $deepLink,
        ];

        // Subscription details
        $sub = $store->currentSubscription;
        $hasActiveSub = $sub && $sub->status === SubscriptionStatus::ACTIVE && $sub->ends_at >= $now;
        $daysRemaining = $hasActiveSub ? (int) max(0, $now->diffInDays($sub->ends_at, false)) : 0;

        $thresholdDays = config('palverse.notifications.subscription_expiring_days', 7);
        $expiringSoon = $hasActiveSub && $sub->ends_at <= $now->copy()->addDays($thresholdDays);

        $subSummary = $hasActiveSub ? [
            'public_id' => $sub->public_id,
            'plan_name_ar' => $sub->plan ? $sub->plan->name_ar : null,
            'plan_name_en' => $sub->plan ? $sub->plan->name_en : null,
            'ends_at' => $sub->ends_at->toIso8601String(),
        ] : null;

        $subscriptionData = [
            'has_active_subscription' => $hasActiveSub,
            'current_subscription' => $subSummary,
            'days_remaining' => $daysRemaining,
            'expiring_soon' => $expiringSoon,
            'public_visibility_allowed' => $isPublic,
        ];

        // Offers summary
        $offersData = [
            'total_offers' => $store->offers()->count(),
            'active_offers' => $store->offers()->where('is_active', true)->count(),
            'currently_valid_offers' => $store->offers()->where('is_active', true)
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now)
                ->count(),
            'expired_offers' => $store->offers()->where('ends_at', '<', $now)->count(),
            'scheduled_offers' => $store->offers()->where('starts_at', '>', $now)->count(),
        ];

        // Profile completeness
        $completeness = $this->completenessService->getCompleteness($store);
        $readiness = $this->completenessService->getReadiness($store);

        return response()->json([
            'success' => true,
            'message' => __('Store dashboard retrieved successfully.'),
            'data' => [
                'store_status' => $storeStatus,
                'subscription' => $subscriptionData,
                'offers' => $offersData,
                'profile_completion' => $completeness,
                'public_readiness' => $readiness,
            ],
            'meta' => [
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
