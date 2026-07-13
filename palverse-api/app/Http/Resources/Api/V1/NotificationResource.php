<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->data ?? [];

        // Exclude internal deduplication keys or other sensitive metadata from public output
        $metadata = Arr::except($data['metadata'] ?? [], ['event_key']);

        return [
            'id' => $this->id, // UUID
            'type' => $data['type'] ?? 'unknown',
            'title_ar' => $data['title_ar'] ?? null,
            'title_en' => $data['title_en'] ?? null,
            'message_ar' => $data['message_ar'] ?? null,
            'message_en' => $data['message_en'] ?? null,
            'entity_type' => $data['entity_type'] ?? null,
            'entity_public_id' => $data['entity_public_id'] ?? null,
            'action_url' => $data['action_url'] ?? null,
            'metadata' => (object) $metadata,
            'is_read' => $this->read_at !== null,
            'read_at' => $this->read_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
