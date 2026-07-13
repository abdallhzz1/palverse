<?php

namespace App\Http\Resources\Api\V1;

use App\Http\Resources\StoreResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $discountPercentage = null;
        if ($this->price !== null && $this->old_price !== null && (float) $this->old_price > 0 && (float) $this->old_price > (float) $this->price) {
            $discountPercentage = round((((float) $this->old_price - (float) $this->price) / (float) $this->old_price) * 100);
        }

        $isCurrentlyValid = false;
        $now = now();
        if ((! $this->starts_at || $this->starts_at <= $now) && (! $this->ends_at || $this->ends_at >= $now)) {
            $isCurrentlyValid = true;
        }

        return [
            'public_id' => $this->public_id,
            'title_ar' => $this->title_ar,
            'title_en' => $this->title_en,
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'price' => $this->price,
            'old_price' => $this->old_price,
            'currency' => $this->currency,
            'discount_percentage' => $discountPercentage,
            'image_url' => $this->image_url,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'is_currently_valid' => $isCurrentlyValid,
            'sort_order' => $this->sort_order,
            'store' => new StoreResource($this->whenLoaded('store')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
