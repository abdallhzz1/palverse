<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\FollowUpCall;
use App\Models\StoreRegistrationRequest;
use App\Models\StoreSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        // Authorize using StoreSubscription which is known to work for follow-up role
        $this->authorize('viewAny', \App\Models\StoreSubscription::class);

        // Store requests
        $submittedRequests = StoreRegistrationRequest::where('status', 'submitted')->count();
        $underReviewRequests = StoreRegistrationRequest::where('status', 'under_review')->count();
        $needsChangesRequests = StoreRegistrationRequest::where('status', 'needs_changes')->count();

        // Join Requests
        $joinRequestsPending = \App\Models\MerchantJoinRequest::where('status', 'pending')->count();

        // Representatives
        $representativesCount = \App\Models\User::role('representative')->count();

        // Subscriptions logic
        $now = now();
        $latestSubIds = \Illuminate\Support\Facades\DB::table('store_subscriptions')
            ->selectRaw('MAX(id)')
            ->whereNull('deleted_at')
            ->groupBy('store_id');

        $renewalsDue7Days = StoreSubscription::whereIn('id', $latestSubIds)
            ->where('status', 'active')
            ->whereBetween('ends_at', [$now, $now->copy()->addDays(7)])
            ->count();
            
        $expiredSubscriptions = StoreSubscription::whereIn('id', $latestSubIds)
            ->where(function($q) use ($now) {
                $q->where('status', 'expired')
                  ->orWhere('ends_at', '<', $now);
            })->count();
            
        // Unpaid
        $unpaidSubscriptions = StoreSubscription::whereIn('id', $latestSubIds)
            ->where('status', 'pending')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => [
                    'submitted' => $submittedRequests,
                    'under_review' => $underReviewRequests,
                    'needs_changes' => $needsChangesRequests,
                ],
                'join_requests' => [
                    'pending' => $joinRequestsPending,
                ],
                'subscriptions' => [
                    'renewals_due_7_days' => $renewalsDue7Days,
                    'expired' => $expiredSubscriptions,
                    'unpaid' => $unpaidSubscriptions,
                ],
                'representatives' => [
                    'total' => $representativesCount,
                ]
            ]
        ]);
    }
}
