<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;
use App\Http\Resources\ZoneResource;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    /**
     * PUB-03: List all cities.
     */
    public function index(): JsonResponse
    {
        $cities = City::query()
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المدن بنجاح.',
            'data' => CityResource::collection($cities),
            'meta' => [],
        ]);
    }

    /**
     * PUB-04: List zones belonging to a city (resolved by public_id).
     */
    public function zones(string $publicId): JsonResponse
    {
        $city = City::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $zones = $city->zones()
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المناطق بنجاح.',
            'data' => ZoneResource::collection($zones),
            'meta' => [],
        ]);
    }
}
