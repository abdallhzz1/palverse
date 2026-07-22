<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\StoreAdvertisement;
use Illuminate\Http\JsonResponse;

class AdvertisementController extends Controller
{
    /**
     * Get active banner advertisements.
     */
    public function banners(): JsonResponse
    {
        $banners = StoreAdvertisement::with('store:id,public_id,slug,name_ar,name_en')
            ->whereHas('store', function ($query) {
                $query->publicVisible();
            })
            ->where('ad_type', 'banner')
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->inRandomOrder()
            ->get();

        // Map the data to include full image URLs
        $data = $banners->map(function ($banner) {
            return [
                'public_id' => $banner->public_id,
                'store' => $banner->store,
                'image_url' => $banner->image_path ? asset('storage/' . $banner->image_path) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
