<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaqResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*/admin/*');

        return [
            'public_id' => $this->public_id,
            'question_ar' => $this->question_ar,
            'question_en' => $this->question_en,
            'answer_ar' => $this->answer_ar,
            'answer_en' => $this->answer_en,
            'category' => $this->category,
            'sort_order' => $this->sort_order,
            'is_active' => $this->when($isAdmin, $this->is_active),
            'created_at' => $this->when($isAdmin, $this->created_at?->toIso8601String()),
            'updated_at' => $this->when($isAdmin, $this->updated_at?->toIso8601String()),
        ];
    }
}
