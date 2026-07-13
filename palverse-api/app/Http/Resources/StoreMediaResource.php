<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'type' => $this->type,
            'url' => $this->url,
            'original_name' => $this->when($this->canSeeOriginalName($request), $this->original_name),
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'width' => $this->width,
            'height' => $this->height,
            'sort_order' => $this->sort_order,
            'alt_text_ar' => $this->alt_text_ar,
            'alt_text_en' => $this->alt_text_en,
            'created_at' => $this->created_at,
        ];
    }

    private function canSeeOriginalName(Request $request): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($this->relationLoaded('store') && $this->store) {
            return $this->store->owner_id === $user->id;
        }

        return false;
    }
}
