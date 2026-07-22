<?php

namespace App\Http\Resources\Api\V1\Representative;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectionReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'receipt_number' => $this->receipt_number,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'payment_purpose' => $this->payment_purpose,
            'collected_at' => $this->collected_at->toIso8601String(),
            'notes' => $this->notes,
            'status' => $this->status->value,
            'settled_at' => $this->settled_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at->toIso8601String(),
            'store' => $this->whenLoaded('store', fn() => $this->store ? [
                'public_id' => $this->store->public_id,
                'name_ar' => $this->store->name_ar,
                'slug' => $this->store->slug,
            ] : null),
            'request' => $this->whenLoaded('request', fn() => $this->request ? [
                'public_id' => $this->request->public_id,
                'store_name_ar' => $this->request->store_name_ar,
            ] : null),
        ];
    }
}
