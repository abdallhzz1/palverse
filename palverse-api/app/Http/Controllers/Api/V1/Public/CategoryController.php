<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * PUB-01: List all categories.
     */
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->orderBy('name_ar')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيفات بنجاح.',
            'data' => CategoryResource::collection($categories),
            'meta' => [],
        ]);
    }

    /**
     * PUB-02: Get a single category by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيف بنجاح.',
            'data' => new CategoryResource($category),
            'meta' => [],
        ]);
    }
}
