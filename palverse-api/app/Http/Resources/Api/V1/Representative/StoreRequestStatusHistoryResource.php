<?php

namespace App\Http\Resources\Api\V1\Representative;

use App\Enums\StoreRequestStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreRequestStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'from_status_label_ar' => $this->from_status ? StoreRequestStatus::tryFrom($this->from_status)?->labelAr() : null,
            'to_status_label_ar' => StoreRequestStatus::tryFrom($this->to_status)?->labelAr(),
            'note' => $this->note,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
