<?php

namespace App\Http\Resources\Api\V1;

use App\Http\Resources\StoreResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreSubscriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->hasRole('admin');

        return [
            'public_id' => $this->public_id,
            'status' => $this->status,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'activated_at' => $this->activated_at,
            'cancelled_at' => $this->cancelled_at,
            'expired_at' => $this->expired_at,
            'cancellation_reason' => $this->when($isAdmin || ($user && $this->store && $this->store->owner_id === $user->id), $this->cancellation_reason),
            'notes' => $this->when($isAdmin, $this->notes),
            'price_snapshot' => $this->price_snapshot,
            'currency_snapshot' => $this->currency_snapshot,
            'plan_name_ar_snapshot' => $this->plan_name_ar_snapshot,
            'plan_name_en_snapshot' => $this->plan_name_en_snapshot,
            'is_currently_valid' => $this->isCurrentlyValid(),
            'plan' => new SubscriptionPlanResource($this->whenLoaded('plan')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'assigned_by' => $this->when($isAdmin, function () {
                return $this->whenLoaded('assignedBy', fn () => [
                    'public_id' => $this->assignedBy->public_id,
                    'name' => $this->assignedBy->name,
                ]);
            }),
            'cancelled_by' => $this->when($isAdmin, function () {
                return $this->whenLoaded('cancelledBy', fn () => [
                    'public_id' => $this->cancelledBy->public_id,
                    'name' => $this->cancelledBy->name,
                ]);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
