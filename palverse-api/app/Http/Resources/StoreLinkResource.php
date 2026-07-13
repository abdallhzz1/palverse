<?php

namespace App\Http\Resources;

use App\Services\StoreLinkService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreLinkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $linkService = app(StoreLinkService::class);

        return [
            'store_public_id' => $this->public_id,
            'slug' => $this->slug,
            'web_url' => $linkService->generateWebUrl($this->resource),
            'deep_link' => $linkService->generateDeepLink($this->resource),
            'qr_svg_url' => route('api.v1.public.stores.qr', ['slug' => $this->slug]),
            'qr_download_url' => route('api.v1.public.stores.qr', ['slug' => $this->slug, 'download' => 1]),
            'is_publicly_visible' => $this->isPubliclyVisible(),
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }
}
