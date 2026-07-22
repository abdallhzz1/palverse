<?php

namespace App\Services;

use App\Enums\CommissionStatus;
use App\Enums\StoreRequestStatus;
use App\Models\CommissionRecord;
use App\Models\CollectionReceipt;
use App\Models\RepresentativeZoneAssignment;
use App\Models\StoreRegistrationRequest;
use App\Models\User;
use Carbon\Carbon;

class RepresentativeDashboardService
{
    public function getSummary(User $rep): array
    {
        $assignedZoneIds = RepresentativeZoneAssignment::where('representative_id', $rep->id)
            ->where('is_active', true)
            ->pluck('zone_id');

        $requests = StoreRegistrationRequest::where('representative_id', $rep->id);

        $commissions = CommissionRecord::where('representative_id', $rep->id);

        $receipts = CollectionReceipt::where('representative_id', $rep->id);

        return [
            'zones' => [
                'assigned_count' => $assignedZoneIds->count(),
            ],
            'requests' => [
                'total' => (clone $requests)->count(),
                'draft' => (clone $requests)->where('status', StoreRequestStatus::DRAFT->value)->count(),
                'submitted' => (clone $requests)->where('status', StoreRequestStatus::SUBMITTED->value)->count(),
                'under_review' => (clone $requests)->where('status', StoreRequestStatus::UNDER_REVIEW->value)->count(),
                'approved' => (clone $requests)->where('status', StoreRequestStatus::APPROVED->value)->count(),
                'rejected' => (clone $requests)->where('status', StoreRequestStatus::REJECTED->value)->count(),
                'needs_changes' => (clone $requests)->where('status', StoreRequestStatus::NEEDS_CHANGES->value)->count(),
            ],
            'commissions' => [
                'pending_count' => (clone $commissions)->where('status', CommissionStatus::PENDING->value)->count(),
                'paid_count' => (clone $commissions)->where('status', CommissionStatus::PAID->value)->count(),
                'pending_total' => (clone $commissions)->whereIn('status', [CommissionStatus::PENDING->value, CommissionStatus::APPROVED->value, CommissionStatus::PAYABLE->value])->sum('amount'),
                'paid_total' => (clone $commissions)->where('status', CommissionStatus::PAID->value)->sum('amount'),
            ],
            'receipts' => [
                'issued_count' => (clone $receipts)->where('status', 'issued')->count(),
                'settled_count' => (clone $receipts)->where('status', 'settled')->count(),
                'total_collected' => (clone $receipts)->whereIn('status', ['issued', 'settled'])->sum('amount'),
                'total_settled' => (clone $receipts)->where('status', 'settled')->sum('amount'),
                'outstanding' => (clone $receipts)->where('status', 'issued')->sum('amount'),
            ],
        ];
    }

    public function getRecentActivity(User $rep, int $limit = 10): array
    {
        $recentRequests = StoreRegistrationRequest::where('representative_id', $rep->id)
            ->latest()->limit($limit)->get()
            ->map(fn($r) => [
                'public_id' => $r->public_id,
                'store_name_ar' => $r->store_name_ar,
                'status' => $r->status->value,
                'status_label_ar' => $r->status->labelAr(),
                'submitted_at' => $r->submitted_at?->toIso8601String(),
                'created_at' => $r->created_at->toIso8601String(),
            ]);

        $recentCommissions = CommissionRecord::where('representative_id', $rep->id)
            ->latest()->limit($limit)->get()
            ->map(fn($c) => [
                'public_id' => $c->public_id,
                'amount' => $c->amount,
                'currency' => $c->currency,
                'status' => $c->status->value,
                'earned_at' => $c->earned_at->toIso8601String(),
            ]);

        $recentReceipts = CollectionReceipt::where('representative_id', $rep->id)
            ->latest()->limit($limit)->get()
            ->map(fn($r) => [
                'public_id' => $r->public_id,
                'receipt_number' => $r->receipt_number,
                'amount' => $r->amount,
                'currency' => $r->currency,
                'status' => $r->status->value,
                'collected_at' => $r->collected_at->toIso8601String(),
            ]);

        return [
            'recent_requests' => $recentRequests,
            'recent_commissions' => $recentCommissions,
            'recent_receipts' => $recentReceipts,
        ];
    }
}
