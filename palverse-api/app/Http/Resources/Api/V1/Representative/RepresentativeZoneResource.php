<?php

namespace App\Http\Resources\Api\V1\Representative;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RepresentativeZoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'is_active' => $this->is_active,
            'assigned_at' => $this->assigned_at?->toIso8601String(),
            'notes' => $this->notes,
            'zone' => [
                'public_id' => $this->zone->public_id,
                'name_ar' => $this->zone->name_ar,
                'name_en' => $this->zone->name_en,
                'city' => [
                    'public_id' => $this->zone->city->public_id,
                    'name_ar' => $this->zone->city->name_ar,
                    'name_en' => $this->zone->city->name_en,
                ],
            ],
        ];
    }
}
