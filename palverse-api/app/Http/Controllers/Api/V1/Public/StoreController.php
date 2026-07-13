<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::publicVisible()->with(['category', 'city', 'zone', 'logo', 'cover']);

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('name_ar', 'like', "%{$q}%")
                    ->orWhere('name_en', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category')) {
            // Using category slug as recommended
            $cat = Category::where('slug', $request->input('category'))->first();
            if ($cat) {
                $query->where('category_id', $cat->id);
            } else {
                $query->where('id', 0); // Force empty result if invalid category
            }
        }

        if ($request->filled('city')) {
            // Using city public_id
            $city = City::where('public_id', $request->input('city'))->first();
            if ($city) {
                $query->where('city_id', $city->id);
            } else {
                $query->where('id', 0);
            }
        }

        if ($request->filled('zone')) {
            // Using zone public_id
            $zone = Zone::where('public_id', $request->input('zone'))->first();
            if ($zone) {
                $query->where('zone_id', $zone->id);
            } else {
                $query->where('id', 0);
            }
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        $stores = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المتاجر بنجاح.',
            'data' => StoreResource::collection($stores)->response()->getData(true)['data'],
            'meta' => StoreResource::collection($stores)->response()->getData(true)['meta'],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $store = Store::publicVisible()
            ->with(['category', 'city', 'zone', 'logo', 'cover', 'gallery'])
            ->where('slug', $slug)
            ->first();

        if (! $store) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر غير موجود أو غير متاح.',
                'error' => [
                    'code' => 'STORE_NOT_FOUND',
                    'details' => [],
                ],
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات المتجر بنجاح.',
            'data' => new StoreResource($store),
            'meta' => [],
        ]);
    }
}
