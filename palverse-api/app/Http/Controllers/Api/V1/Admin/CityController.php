<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\City\StoreCityRequest;
use App\Http\Requests\Api\V1\Admin\City\UpdateCityRequest;
use App\Http\Resources\CityResource;
use App\Http\Resources\ZoneResource;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * ADM-17: List all cities with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 25);

        $cities = City::query()
            ->orderBy('name_ar')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المدن بنجاح.',
            'data' => CityResource::collection($cities),
            'meta' => [
                'pagination' => [
                    'total' => $cities->total(),
                    'count' => $cities->count(),
                    'per_page' => $cities->perPage(),
                    'current_page' => $cities->currentPage(),
                    'total_pages' => $cities->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * ADM-18: Create a new city.
     */
    public function store(StoreCityRequest $request): JsonResponse
    {
        $city = City::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المدينة بنجاح.',
            'data' => new CityResource($city),
            'meta' => [],
        ], 201);
    }

    /**
     * ADM-19: Get a single city by public_id.
     */
    public function show(string $publicId): JsonResponse
    {
        $city = City::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المدينة بنجاح.',
            'data' => new CityResource($city),
            'meta' => [],
        ]);
    }

    /**
     * ADM-20: Update city names.
     */
    public function update(UpdateCityRequest $request, string $publicId): JsonResponse
    {
        $city = City::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $city->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المدينة بنجاح.',
            'data' => new CityResource($city->fresh()),
            'meta' => [],
        ]);
    }

    /**
     * ADM-21: Delete a city.
     *
     * The database restricts city deletion if it has zones.
     */
    public function destroy(string $publicId): JsonResponse
    {
        $city = City::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        if ($city->zones()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف المدينة لأن هناك مناطق مرتبطة بها.',
                'error' => [
                    'code' => 'CITY_HAS_ZONES',
                    'details' => [],
                ],
                'meta' => [],
            ], 409);
        }

        $city->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المدينة بنجاح.',
            'data' => null,
            'meta' => [],
        ]);
    }

    /**
     * Convenience: list all zones for a city (admin view).
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
