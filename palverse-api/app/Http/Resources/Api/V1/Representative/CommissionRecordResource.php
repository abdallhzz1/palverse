<?php

namespace App\Http\Resources\Api\V1\Representative;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'reason' => $this->reason,
            'earned_at' => $this->earned_at->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
            'request' => $this->whenLoaded('request', fn() => $this->request ? [
                'public_id' => $this->request->public_id,
                'store_name_ar' => $this->request->store_name_ar,
            ] : null),
        ];
    }
}
