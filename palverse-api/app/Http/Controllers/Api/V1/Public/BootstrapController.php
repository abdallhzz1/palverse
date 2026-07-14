<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\StaticPageSummaryResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CityResource;
use App\Models\Category;
use App\Models\City;
use App\Models\StaticPage;
use App\Services\PublicReferenceCacheService;
use App\Services\SystemSettingService;
use Illuminate\Http\JsonResponse;

class BootstrapController extends Controller
{
    protected SystemSettingService $settingsService;

    protected PublicReferenceCacheService $cacheService;

    public function __construct(SystemSettingService $settingsService, PublicReferenceCacheService $cacheService)
    {
        $this->settingsService = $settingsService;
        $this->cacheService = $cacheService;
    }

    /**
     * Get frontend bootstrap payload.
     */
    public function __invoke(): JsonResponse
    {
        $data = $this->cacheService->rememberBootstrap(function () {
            $settings = $this->settingsService->getPublicSettings();

            // Expose only safe public setting groups
            $bootstrapSettings = [
                'general' => $settings['general'] ?? [],
                'branding' => $settings['branding'] ?? [],
                'contact' => $settings['contact'] ?? [],
                'social' => $settings['social'] ?? [],
                'application' => $settings['application'] ?? [],
            ];

            $categories = Category::all();
            $cities = City::all();
            $pages = StaticPage::published()->ordered()->get();

            return [
                'settings' => $bootstrapSettings,
                'categories' => CategoryResource::collection($categories)->resolve(),
                'cities' => CityResource::collection($cities)->resolve(),
                'pages' => StaticPageSummaryResource::collection($pages)->resolve(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات التهيئة بنجاح.',
            'data' => $data,
            'meta' => [
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
