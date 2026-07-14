<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;
use App\Http\Resources\ZoneResource;
use App\Models\City;
use App\Services\PublicReferenceCacheService;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    public function __construct(protected PublicReferenceCacheService $cacheService) {}

    /**
     * PUB-03: List all cities.
     */
    public function index(): JsonResponse
    {
        $data = $this->cacheService->remember('cities', [], function () {
            $cities = City::query()
                ->orderBy('name_ar')
                ->get();

            return CityResource::collection($cities)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المدن بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }

    /**
     * PUB-04: List zones belonging to a city (resolved by public_id).
     */
    public function zones(string $publicId): JsonResponse
    {
        $data = $this->cacheService->remember('cities', ['action' => 'zones', 'public_id' => $publicId], function () use ($publicId) {
            $city = City::query()
                ->where('public_id', $publicId)
                ->firstOrFail();

            $zones = $city->zones()
                ->orderBy('name_ar')
                ->get();

            return ZoneResource::collection($zones)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المناطق بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }
}
