<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\StoreAdvertisement;
use App\Support\PublicStorageUrl;
use Illuminate\Http\JsonResponse;

class AdvertisementController extends Controller
{
    /**
     * Get active banner advertisements for the public homepage.
     */
    public function banners(): JsonResponse
    {
        $today = now()->toDateString();

        $banners = StoreAdvertisement::query()
            ->with(['store' => function ($query) {
                $query->select('id', 'public_id', 'slug', 'name_ar', 'name_en');
            }])
            ->whereHas('store', function ($query) {
                $query->publicVisible();
            })
            ->where('ad_type', 'banner')
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereNotNull('image_path')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $data = $banners
            ->filter(fn (StoreAdvertisement $banner) => $banner->store !== null && filled($banner->image_path))
            ->values()
            ->map(function (StoreAdvertisement $banner) {
                $imageUrl = PublicStorageUrl::fromPath($banner->image_path);

                return [
                    'public_id' => $banner->public_id,
                    'image_path' => $banner->image_path,
                    'image_url' => $imageUrl,
                    'store' => [
                        'public_id' => $banner->store->public_id,
                        'slug' => $banner->store->slug,
                        'name_ar' => $banner->store->name_ar,
                        'name_en' => $banner->store->name_en,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
