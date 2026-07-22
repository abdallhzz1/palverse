<?php

namespace App\Http\Resources\Api\V1\Representative;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RejectionReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'business_name' => $this->business_name,
            'owner_name' => $this->owner_name,
            'phone' => $this->phone,
            'refusal_reason_code' => $this->refusal_reason_code->value,
            'refusal_reason_label_ar' => $this->refusal_reason_code->labelAr(),
            'refusal_reason_text' => $this->refusal_reason_text,
            'contacted_at' => $this->contacted_at->toIso8601String(),
            'follow_up_required' => $this->follow_up_required,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
            'zone' => $this->whenLoaded('zone', fn() => [
                'public_id' => $this->zone->public_id,
                'name_ar' => $this->zone->name_ar,
                'name_en' => $this->zone->name_en,
            ]),
            'representative' => $this->whenLoaded('representative', fn() => [
                'public_id' => $this->representative->public_id,
                'full_name' => $this->representative->name,
            ]),
        ];
    }
}
