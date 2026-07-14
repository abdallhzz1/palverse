<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\PublicReferenceCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(protected PublicReferenceCacheService $cacheService) {}

    /**
     * PUB-01: List all categories.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $this->cacheService->remember('categories', [], function () {
            $categories = Category::query()
                ->orderBy('name_ar')
                ->get();

            return CategoryResource::collection($categories)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيفات بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }

    /**
     * PUB-02: Get a single category by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $data = $this->cacheService->remember('categories', ['slug' => $slug], function () use ($slug) {
            $category = Category::query()
                ->where('slug', $slug)
                ->firstOrFail();

            return (new CategoryResource($category))->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيف بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }
}
