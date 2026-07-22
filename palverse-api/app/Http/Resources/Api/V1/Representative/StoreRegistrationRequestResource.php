<?php

namespace App\Http\Resources\Api\V1\Representative;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreRegistrationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'proposed_merchant_name' => $this->proposed_merchant_name,
            'proposed_merchant_phone' => $this->proposed_merchant_phone,
            'proposed_merchant_email' => $this->proposed_merchant_email,
            'store_name_ar' => $this->store_name_ar,
            'store_name_en' => $this->store_name_en,
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'website' => $this->website,
            'address_ar' => $this->address_ar,
            'address_en' => $this->address_en,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status->value,
            'status_label_ar' => $this->status->labelAr(),
            'representative_notes' => $this->representative_notes,
            'admin_notes' => $this->when(
                $this->status->value !== 'draft' && $this->admin_notes,
                $this->admin_notes
            ),
            'rejection_reason' => $this->when(
                in_array($this->status->value, ['rejected', 'needs_changes']),
                $this->rejection_reason
            ),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'zone' => $this->whenLoaded('zone', fn() => [
                'public_id' => $this->zone->public_id,
                'name_ar' => $this->zone->name_ar,
                'name_en' => $this->zone->name_en,
            ]),
            'city' => $this->whenLoaded('city', fn() => [
                'public_id' => $this->city->public_id,
                'name_ar' => $this->city->name_ar,
                'name_en' => $this->city->name_en,
            ]),
            'category' => $this->whenLoaded('category', fn() => $this->category ? [
                'public_id' => $this->category->public_id,
                'name_ar' => $this->category->name_ar,
                'name_en' => $this->category->name_en,
            ] : null),
            'resulting_store' => $this->when(
                $this->status->value === 'approved' && $this->resultingStore,
                fn() => $this->whenLoaded('resultingStore', fn() => [
                    'public_id' => $this->resultingStore->public_id,
                    'name_ar' => $this->resultingStore->name_ar,
                    'slug' => $this->resultingStore->slug ?? null,
                ])
            ),
            'resulting_merchant' => $this->when(
                $this->status->value === 'approved' && $this->resultingMerchant,
                fn() => $this->whenLoaded('resultingMerchant', fn() => [
                    'public_id' => $this->resultingMerchant->public_id,
                    'name' => $this->resultingMerchant->name,
                ])
            ),
            'representative' => $this->whenLoaded('representative', fn() => [
                'public_id' => $this->representative->public_id,
                'name' => $this->representative->name,
                'email' => $this->representative->email,
                'phone' => $this->representative->phone,
            ]),
            'status_history' => StoreRequestStatusHistoryResource::collection(
                $this->whenLoaded('statusHistory')
            ),
        ];
    }
}
