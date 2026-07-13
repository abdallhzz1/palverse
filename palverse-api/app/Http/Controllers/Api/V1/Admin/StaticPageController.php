<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminStaticPageIndexRequest;
use App\Http\Requests\Api\V1\Admin\StoreStaticPageRequest;
use App\Http\Requests\Api\V1\Admin\UpdateStaticPageRequest;
use App\Http\Resources\Api\V1\StaticPageResource;
use App\Models\StaticPage;
use App\Services\StaticPageService;
use Illuminate\Http\JsonResponse;

class StaticPageController extends Controller
{
    protected StaticPageService $pageService;

    public function __construct(StaticPageService $pageService)
    {
        $this->pageService = $pageService;
    }

    /**
     * Get pages for admin.
     */
    public function index(AdminStaticPageIndexRequest $request): JsonResponse
    {
        $query = StaticPage::query();

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('title_ar', 'like', "%{$q}%")
                    ->orWhere('title_en', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('content_ar', 'like', "%{$q}%")
                    ->orWhere('content_en', 'like', "%{$q}%");
            });
        }

        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $sort = $request->input('sort', 'sort_order');
        $direction = $request->input('direction', 'asc');
        $query->orderBy($sort, $direction);

        $perPage = $request->input('per_page', 15);
        $pages = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الصفحات بنجاح.',
            'data' => StaticPageResource::collection($pages)->response()->getData(true)['data'],
            'meta' => StaticPageResource::collection($pages)->response()->getData(true)['meta'],
        ]);
    }

    /**
     * Store a page.
     */
    public function store(StoreStaticPageRequest $request): JsonResponse
    {
        $page = $this->pageService->createPage($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الصفحة بنجاح.',
            'data' => new StaticPageResource($page),
            'meta' => [],
        ], 201);
    }

    /**
     * Show a page detail.
     */
    public function show(string $publicId): JsonResponse
    {
        $page = StaticPage::where('public_id', $publicId)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب تفاصيل الصفحة بنجاح.',
            'data' => new StaticPageResource($page),
            'meta' => [],
        ]);
    }

    /**
     * Update a page.
     */
    public function update(UpdateStaticPageRequest $request, string $publicId): JsonResponse
    {
        $page = StaticPage::where('public_id', $publicId)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة.',
            ], 404);
        }

        $this->pageService->updatePage($page, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الصفحة بنجاح.',
            'data' => new StaticPageResource($page->fresh()),
            'meta' => [],
        ]);
    }

    /**
     * Delete a page.
     */
    public function destroy(string $publicId): JsonResponse
    {
        $page = StaticPage::where('public_id', $publicId)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة.',
            ], 404);
        }

        $this->pageService->deletePage($page);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الصفحة بنجاح.',
            'data' => [],
            'meta' => [],
        ]);
    }

    /**
     * Publish a page.
     */
    public function publish(string $publicId): JsonResponse
    {
        $page = StaticPage::where('public_id', $publicId)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة.',
            ], 404);
        }

        $this->pageService->publish($page);

        return response()->json([
            'success' => true,
            'message' => 'تم نشر الصفحة بنجاح.',
            'data' => new StaticPageResource($page),
            'meta' => [],
        ]);
    }

    /**
     * Unpublish a page.
     */
    public function unpublish(string $publicId): JsonResponse
    {
        $page = StaticPage::where('public_id', $publicId)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة.',
            ], 404);
        }

        $this->pageService->unpublish($page);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء نشر الصفحة بنجاح.',
            'data' => new StaticPageResource($page),
            'meta' => [],
        ]);
    }
}
