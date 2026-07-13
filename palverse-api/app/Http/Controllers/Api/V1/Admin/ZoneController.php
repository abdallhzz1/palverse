<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Zone\StoreZoneRequest;
use App\Http\Requests\Api\V1\Admin\Zone\UpdateZoneRequest;
use App\Http\Resources\ZoneResource;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
    /**
     * ADM-22: List all zones with optional city filter.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 25);

        $query = Zone::query()->with('city')->orderBy('name_ar');

        if ($request->filled('city')) {
            $query->whereHas('city', fn ($q) => $q->where('public_id', $request->query('city')));
        }

        $zones = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المناطق بنجاح.',
            'data' => ZoneResource::collection($zones),
            'meta' => [
                'pagination' => [
                    'total' => $zones->total(),
                    'count' => $zones->count(),
                    'per_page' => $zones->perPage(),
                    'current_page' => $zones->currentPage(),
                    'total_pages' => $zones->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * ADM-23: Create a new zone.
     */
    public function store(StoreZoneRequest $request): JsonResponse
    {
        $zone = Zone::create($request->validated());
        $zone->load('city');

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المنطقة بنجاح.',
            'data' => new ZoneResource($zone),
            'meta' => [],
        ], 201);
    }

    /**
     * ADM-24: Get a single zone by public_id.
     */
    public function show(string $publicId): JsonResponse
    {
        $zone = Zone::query()
            ->with('city')
            ->where('public_id', $publicId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المنطقة بنجاح.',
            'data' => new ZoneResource($zone),
            'meta' => [],
        ]);
    }

    /**
     * ADM-25: Update zone names (city reassignment is out of MVP scope).
     */
    public function update(UpdateZoneRequest $request, string $publicId): JsonResponse
    {
        $zone = Zone::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $zone->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المنطقة بنجاح.',
            'data' => new ZoneResource($zone->fresh()->load('city')),
            'meta' => [],
        ]);
    }

    /**
     * ADM-26: Delete a zone.
     *
     * Blocked when active stores reference this zone.
     */
    public function destroy(string $publicId): JsonResponse
    {
        $zone = Zone::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المنطقة بنجاح.',
            'data' => null,
            'meta' => [],
        ]);
    }
}
