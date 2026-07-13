<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserManagementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'preferred_locale' => $this->preferred_locale,
            'status' => $this->status?->value ?? $this->status,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'suspended_at' => $this->suspended_at?->toIso8601String(),
            'suspension_reason' => $this->when($request->user()?->can('users.manage'), $this->suspension_reason),
            'deactivated_at' => $this->deactivated_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'stores_count' => $this->whenCounted('storesOwned'),
            'active_subscriptions_count' => $this->whenCounted('subscriptionsAssigned', function ($count) {
                // Approximate representation, exact active logic might differ depending on how counted.
                return $count;
            }),
            'unread_notifications_count' => $this->whenCounted('unreadNotifications'),
            'created_by' => $this->whenLoaded('createdBy', function () {
                return [
                    'public_id' => $this->createdBy->public_id,
                    'name' => $this->createdBy->name,
                ];
            }),
            'suspended_by' => $this->whenLoaded('suspendedBy', function () {
                return [
                    'public_id' => $this->suspendedBy->public_id,
                    'name' => $this->suspendedBy->name,
                ];
            }),
            'deactivated_by' => $this->whenLoaded('deactivatedBy', function () {
                return [
                    'public_id' => $this->deactivatedBy->public_id,
                    'name' => $this->deactivatedBy->name,
                ];
            }),
        ];
    }
}
