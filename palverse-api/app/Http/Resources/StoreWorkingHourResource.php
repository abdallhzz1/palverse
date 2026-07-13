<?php

namespace App\Http\Resources;

use App\Enums\DayOfWeek;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreWorkingHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $dayOfWeek = DayOfWeek::from($this->day_of_week);

        return [
            'public_id' => $this->public_id,
            'day_of_week' => $this->day_of_week,
            'day_label_ar' => $dayOfWeek->labelAr(),
            'day_label_en' => $dayOfWeek->labelEn(),
            'period_index' => $this->period_index,
            'opens_at' => $this->opens_at ? substr($this->opens_at, 0, 5) : null,
            'closes_at' => $this->closes_at ? substr($this->closes_at, 0, 5) : null,
            'is_closed' => $this->is_closed,
        ];
    }

    /**
     * Helper to group working hours by day.
     */
    public static function collectionGroupedByDay($resource)
    {
        $grouped = [];

        // Initialize all days
        for ($i = 0; $i <= 6; $i++) {
            $dayOfWeek = DayOfWeek::from($i);
            $grouped[$i] = [
                'day_of_week' => $i,
                'day_label_ar' => $dayOfWeek->labelAr(),
                'day_label_en' => $dayOfWeek->labelEn(),
                'is_closed' => true,
                'periods' => [],
            ];
        }

        foreach ($resource as $hour) {
            $day = $hour->day_of_week;
            $grouped[$day]['is_closed'] = (bool) $hour->is_closed;

            if (! $hour->is_closed) {
                $grouped[$day]['is_closed'] = false;
                $grouped[$day]['periods'][] = [
                    'public_id' => $hour->public_id,
                    'opens_at' => substr($hour->opens_at, 0, 5),
                    'closes_at' => substr($hour->closes_at, 0, 5),
                ];
            }
        }

        return array_values($grouped);
    }
}
