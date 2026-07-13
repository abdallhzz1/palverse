<?php

namespace App\Services;

use App\Enums\StoreStatus;
use App\Models\Store;

class StoreProfileCompletenessService
{
    /**
     * Compute store profile completeness details.
     */
    public function getCompleteness(Store $store): array
    {
        $checks = [
            'basic_information' => ! empty($store->name_ar) && ! empty($store->description_ar),
            'logo' => $store->logo()->exists(),
            'cover' => $store->cover()->exists(),
            'gallery' => $store->gallery()->exists(),
            'contact_information' => ! empty($store->phone),
            'working_hours' => $store->workingHours()->exists(),
            'social_links' => $store->socialLinks()->exists(),
        ];

        $total = count($checks);
        $completed = count(array_filter($checks));
        $percentage = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'percentage' => $percentage,
            'completed' => $completed,
            'total' => $total,
            'checks' => $checks,
        ];
    }

    /**
     * Evaluate public readiness and blocking reasons.
     */
    public function getReadiness(Store $store): array
    {
        $blockingReasons = [];

        if ($store->status !== StoreStatus::APPROVED) {
            $blockingReasons[] = 'NOT_APPROVED';
        }

        if (! $store->is_active) {
            $blockingReasons[] = 'INACTIVE';
        }

        if (! $store->currentSubscription()->exists()) {
            $blockingReasons[] = 'NO_ACTIVE_SUBSCRIPTION';
        }

        if ($store->trashed()) {
            $blockingReasons[] = 'DELETED';
        }

        return [
            'ready' => empty($blockingReasons),
            'blocking_reasons' => $blockingReasons,
        ];
    }
}
