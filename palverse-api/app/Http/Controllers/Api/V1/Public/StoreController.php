<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Public\StoreSearchRequest;
use App\Http\Resources\Api\V1\OfferResource;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Services\StoreSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    protected StoreSearchService $searchService;

    public function __construct(StoreSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function index(StoreSearchRequest $request): JsonResponse
    {
        $stores = $this->searchService->search($request->all());

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المتاجر بنجاح.',
            'data' => StoreResource::collection($stores)->response()->getData(true)['data'],
            'meta' => array_merge(
                StoreResource::collection($stores)->response()->getData(true)['meta'],
                [
                    'query' => $request->input('query'),
                    'applied_filters' => $request->except(['query', 'sort', 'direction', 'page', 'per_page']),
                    'sort' => $request->input('sort', 'newest'),
                    'direction' => $request->input('direction', 'desc'),
                    'generated_at' => now()->toIso8601String(),
                ]
            ),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $store = Store::publicVisible()
            ->with([
                'category', 'city', 'zone', 'logo', 'cover', 'gallery', 'workingHours', 'socialLinks',
                'activeOffers' => function ($query) {
                    $query->limit(5);
                },
            ])
            ->withCount('activeOffers')
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('public_id', $slug);
            })
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

    public function offers(Request $request, string $slug): JsonResponse
    {
        $store = Store::publicVisible()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('public_id', $slug);
            })
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

        $perPage = $request->input('per_page', 15);
        $offers = $store->activeOffers()->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب العروض بنجاح.',
            'data' => OfferResource::collection($offers)->response()->getData(true)['data'],
            'meta' => OfferResource::collection($offers)->response()->getData(true)['meta'],
        ]);
    }

    /**
     * Get related stores.
     */
    public function related(Request $request, string $slug): JsonResponse
    {
        $store = Store::publicVisible()->where('slug', $slug)->first();

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

        $limit = (int) $request->input('limit', 6);
        $limit = min(max($limit, 1), 20);

        $relatedStores = Store::publicVisible()
            ->where('id', '!=', $store->id)
            ->where('category_id', $store->category_id)
            ->orderByRaw('CASE WHEN city_id = ? THEN 1 ELSE 2 END ASC', [$store->city_id])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المتاجر ذات الصلة بنجاح.',
            'data' => StoreResource::collection($relatedStores),
            'meta' => [
                'limit' => $limit,
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
