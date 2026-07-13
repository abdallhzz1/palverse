<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'slug' => $this->slug,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'website' => $this->website,
            'address_ar' => $this->address_ar,
            'address_en' => $this->address_en,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'approved_at' => $this->approved_at,
            'rejected_at' => $this->rejected_at,
            'rejection_reason' => $this->when($this->canSeeRejectionReason($request), $this->rejection_reason),
            'owner' => $this->whenLoaded('owner', fn () => [
                'public_id' => $this->owner->public_id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
            ]),
            'category' => $this->whenLoaded('category', fn () => [
                'public_id' => $this->category->public_id,
                'name_ar' => $this->category->name_ar,
                'name_en' => $this->category->name_en,
                'slug' => $this->category->slug,
            ]),
            'city' => $this->whenLoaded('city', fn () => [
                'public_id' => $this->city->public_id,
                'name_ar' => $this->city->name_ar,
                'name_en' => $this->city->name_en,
            ]),
            'zone' => $this->whenLoaded('zone', fn () => [
                'public_id' => $this->zone->public_id,
                'name_ar' => $this->zone->name_ar,
                'name_en' => $this->zone->name_en,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'logo' => new StoreMediaResource($this->whenLoaded('logo')),
            'cover' => new StoreMediaResource($this->whenLoaded('cover')),
            'gallery' => StoreMediaResource::collection($this->whenLoaded('gallery')),
        ];
    }

    private function canSeeRejectionReason(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }

        if ($user->can('stores.view')) { // Admins with view can see reason
            // But wait, merchant also has stores.view.
            // Check if admin or owner
            if ($user->hasRole('admin')) {
                return true;
            }
        }

        return $this->owner_id === $user->id;
    }
}
