<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\AdPlacement;
use App\Http\Controllers\Controller;
use App\Models\StoreAdvertisement;
use App\Support\BusinessDate;
use App\Support\PublicStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdvertisementController extends Controller
{
    /**
     * Get active banner advertisements for a specific public placement.
     */
    public function banners(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'placement' => ['required', 'string', Rule::in(AdPlacement::values())],
            'exclude_store' => ['nullable', 'string'],
        ]);

        $today = BusinessDate::today();
        $placement = AdPlacement::from($validated['placement']);
        $excludeStore = $validated['exclude_store'] ?? null;

        $banners = StoreAdvertisement::query()
            ->with(['store' => function ($query) {
                $query->select('id', 'public_id', 'slug', 'name_ar', 'name_en');
            }])
            ->whereHas('store', function ($query) use ($excludeStore) {
                $query->publicVisible();
                if (is_string($excludeStore) && $excludeStore !== '') {
                    $query->where('public_id', '!=', $excludeStore)
                        ->where(function ($inner) use ($excludeStore) {
                            $inner->whereNull('slug')
                                ->orWhere('slug', '!=', $excludeStore);
                        });
                }
            })
            ->where('ad_type', 'banner')
            ->forPlacement($placement)
            ->currentlyScheduled($today)
            ->whereNotNull('image_path')
            ->orderByDesc('created_at')
            ->limit($placement->maxConcurrent())
            ->get();

        $data = $banners
            ->filter(fn (StoreAdvertisement $banner) => $banner->store !== null && filled($banner->image_path))
            ->values()
            ->map(function (StoreAdvertisement $banner) use ($placement) {
                $imageUrl = PublicStorageUrl::fromPath($banner->image_path);
                $slug = $banner->store->slug ?: $banner->store->public_id;

                return [
                    'public_id' => $banner->public_id,
                    'placement' => $placement->value,
                    'image_path' => $banner->image_path,
                    'image_url' => $imageUrl,
                    'store' => [
                        'public_id' => $banner->store->public_id,
                        'slug' => $slug,
                        'name_ar' => $banner->store->name_ar,
                        'name_en' => $banner->store->name_en,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'placement' => $placement->value,
                'placement_meta' => [
                    'id' => $placement->value,
                    'label_ar' => $placement->labelAr(),
                    'aspect_ratio' => $placement->aspectRatio(),
                    'recommended_size' => $placement->recommendedSize(),
                    'ui_variant' => $placement->uiVariant(),
                ],
                'business_today' => $today,
                'business_timezone' => config('palverse.business_timezone'),
            ],
        ]);
    }
}
