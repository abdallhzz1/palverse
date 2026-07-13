<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'code' => $this->code,
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'price' => $this->price,
            'currency' => $this->currency,
            'duration_days' => $this->duration_days,
            'max_offers' => $this->max_offers,
            'max_gallery_images' => $this->max_gallery_images,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
