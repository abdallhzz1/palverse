<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaticPageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->is('*/admin/*');

        return [
            'public_id' => $this->when($isAdmin, $this->public_id),
            'slug' => $this->slug,
            'title_ar' => $this->title_ar,
            'title_en' => $this->title_en,
            'content_ar' => $this->content_ar,
            'content_en' => $this->content_en,
            'excerpt_ar' => $this->excerpt_ar,
            'excerpt_en' => $this->excerpt_en,
            'is_published' => $this->when($isAdmin, $this->is_published),
            'published_at' => $this->published_at?->toIso8601String(),
            'sort_order' => $this->when($isAdmin, $this->sort_order),
            'seo_title_ar' => $this->seo_title_ar,
            'seo_title_en' => $this->seo_title_en,
            'seo_description_ar' => $this->seo_description_ar,
            'seo_description_en' => $this->seo_description_en,
            'created_at' => $this->when($isAdmin, $this->created_at?->toIso8601String()),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
