<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\Store;
use App\Models\StoreWorkingHour;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreWorkingHoursService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Replaces the entire working hours schedule for a store.
     */
    public function replaceSchedule(Store $store, array $days): void
    {
        DB::transaction(function () use ($store, $days) {
            // Delete existing
            $store->workingHours()->delete();

            $insertData = [];

            foreach ($days as $day) {
                if ($day['is_closed']) {
                    $insertData[] = [
                        'public_id' => (string) Str::ulid(),
                        'store_id' => $store->id,
                        'day_of_week' => $day['day_of_week'],
                        'period_index' => 1,
                        'opens_at' => null,
                        'closes_at' => null,
                        'is_closed' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                } else {
                    $periodIndex = 1;

                    // Sort periods chronologically
                    $periods = $day['periods'];
                    usort($periods, fn ($a, $b) => strcmp($a['opens_at'], $b['opens_at']));

                    foreach ($periods as $period) {
                        $insertData[] = [
                            'public_id' => (string) Str::ulid(),
                            'store_id' => $store->id,
                            'day_of_week' => $day['day_of_week'],
                            'period_index' => $periodIndex++,
                            'opens_at' => $period['opens_at'],
                            'closes_at' => $period['closes_at'],
                            'is_closed' => false,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            StoreWorkingHour::insert($insertData);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreWorkingHoursUpdated,
                subject: $store,
                metadata: ['days_count' => count($days)]
            );
        });
    }
}
