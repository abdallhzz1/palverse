<?php

namespace App\Http\Resources\Api\V1;

use App\Enums\AuditAction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actorData = null;
        if ($this->actor_public_id || $this->actor_type === 'system') {
            $actorData = [
                'type' => $this->actor_type,
                'public_id' => $this->actor_public_id,
                'name' => $this->actor_name,
                'email' => $this->actor_email,
            ];
        }

        $subjectData = null;
        if ($this->subject_type || $this->subject_public_id) {
            $subjectData = [
                'type' => $this->subject_type,
                'public_id' => $this->subject_public_id,
                'label' => $this->subject_label,
            ];
        }

        return [
            'public_id' => $this->public_id,
            'action' => $this->action instanceof AuditAction ? $this->action->value : $this->action,
            'actor' => $actorData,
            'subject' => $subjectData,

            'route' => $this->route,
            'method' => $this->method,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'request_id' => $this->request_id,

            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'metadata' => $this->metadata,

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
