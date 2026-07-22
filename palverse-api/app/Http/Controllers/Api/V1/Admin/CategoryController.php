<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Admin\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * ADM-12: List categories with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 25);

        $categories = Category::query()
            ->when($request->filled('query'), function ($query) use ($request) {
                $q = $request->input('query');
                $query->where(function ($builder) use ($q) {
                    $builder->where('name_ar', 'like', "%{$q}%")
                        ->orWhere('name_en', 'like', "%{$q}%")
                        ->orWhere('slug', 'like', "%{$q}%")
                        ->orWhere('public_id', $q);
                });
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                // Back-compat with admin UI that historically sent `search`
                $q = $request->input('search');
                $query->where(function ($builder) use ($q) {
                    $builder->where('name_ar', 'like', "%{$q}%")
                        ->orWhere('name_en', 'like', "%{$q}%")
                        ->orWhere('slug', 'like', "%{$q}%");
                });
            })
            ->orderBy('name_ar')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيفات بنجاح.',
            'data' => CategoryResource::collection($categories),
            'meta' => [
                'pagination' => [
                    'total' => $categories->total(),
                    'count' => $categories->count(),
                    'per_page' => $categories->perPage(),
                    'current_page' => $categories->currentPage(),
                    'total_pages' => $categories->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * ADM-13: Create a new category.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء التصنيف بنجاح.',
            'data' => new CategoryResource($category),
            'meta' => [],
        ], 201);
    }

    /**
     * ADM-14: Get a single category by public_id.
     */
    public function show(string $publicId): JsonResponse
    {
        $category = Category::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب التصنيف بنجاح.',
            'data' => new CategoryResource($category),
            'meta' => [],
        ]);
    }

    /**
     * ADM-15: Update an existing category (names only; slug is immutable).
     */
    public function update(UpdateCategoryRequest $request, string $publicId): JsonResponse
    {
        $category = Category::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث التصنيف بنجاح.',
            'data' => new CategoryResource($category->fresh()),
            'meta' => [],
        ]);
    }

    /**
     * ADM-16: Delete a category (restricted if stores are assigned).
     */
    public function destroy(string $publicId): JsonResponse
    {
        $category = Category::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        if ($category->stores()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف التصنيف لأن هناك محلات مرتبطة به.',
                'error' => [
                    'code' => 'CATEGORY_HAS_STORES',
                    'details' => [],
                ],
                'meta' => [],
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف التصنيف بنجاح.',
            'data' => null,
            'meta' => [],
        ]);
    }
}
