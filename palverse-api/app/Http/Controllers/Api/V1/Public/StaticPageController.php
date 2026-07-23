<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\StaticPageResource;
use App\Http\Resources\Api\V1\StaticPageSummaryResource;
use App\Models\StaticPage;
use App\Services\PublicReferenceCacheService;
use Illuminate\Http\JsonResponse;

class StaticPageController extends Controller
{
    public function __construct(protected PublicReferenceCacheService $cacheService) {}

    /**
     * Get published static pages list (summaries).
     */
    public function index(): JsonResponse
    {
        $data = $this->cacheService->remember('pages', [], function () {
            $pages = StaticPage::published()->ordered()->get();

            return StaticPageSummaryResource::collection($pages)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الصفحات بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }

    /**
     * Get static page details by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $data = $this->cacheService->rememberPresent('pages', ['slug' => $slug], function () use ($slug) {
            $page = StaticPage::published()
                ->whereIn('slug', $this->candidateSlugs($slug))
                ->first();

            if (! $page) {
                return null;
            }

            return (new StaticPageResource($page))->resolve();
        });

        if (! $data) {
            return response()->json([
                'success' => false,
                'message' => 'الصفحة غير موجودة أو غير منشورة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب تفاصيل الصفحة بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }

    /**
     * Accept both short production slugs and longer legacy variants.
     *
     * @return list<string>
     */
    protected function candidateSlugs(string $slug): array
    {
        $aliases = [
            'about' => 'about-us',
            'about-us' => 'about',
            'privacy' => 'privacy-policy',
            'privacy-policy' => 'privacy',
            'terms' => 'terms-and-conditions',
            'terms-and-conditions' => 'terms',
            'terms-of-service' => 'terms',
            'contact' => 'contact-us',
            'contact-us' => 'contact',
        ];

        $candidates = [$slug];
        if (isset($aliases[$slug])) {
            $candidates[] = $aliases[$slug];
        }

        return array_values(array_unique($candidates));
    }
}
