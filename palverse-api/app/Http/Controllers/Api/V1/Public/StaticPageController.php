<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\StaticPageResource;
use App\Http\Resources\Api\V1\StaticPageSummaryResource;
use App\Models\StaticPage;
use Illuminate\Http\JsonResponse;

class StaticPageController extends Controller
{
    /**
     * Get published static pages list (summaries).
     */
    public function index(): JsonResponse
    {
        $pages = StaticPage::published()->ordered()->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الصفحات بنجاح.',
            'data' => StaticPageSummaryResource::collection($pages),
            'meta' => [],
        ]);
    }

    /**
     * Get static page details by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $page = StaticPage::published()->where('slug', $slug)->first();
        if (! $page) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة أو غير منشورة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب تفاصيل الصفحة بنجاح.',
            'data' => new StaticPageResource($page),
            'meta' => [],
        ]);
    }
}
