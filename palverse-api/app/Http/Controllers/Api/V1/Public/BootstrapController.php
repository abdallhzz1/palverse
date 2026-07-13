<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\StaticPageSummaryResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CityResource;
use App\Models\Category;
use App\Models\City;
use App\Models\StaticPage;
use App\Services\SystemSettingService;
use Illuminate\Http\JsonResponse;

class BootstrapController extends Controller
{
    protected SystemSettingService $settingsService;

    public function __construct(SystemSettingService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get frontend bootstrap payload.
     */
    public function __invoke(): JsonResponse
    {
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

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات التهيئة بنجاح.',
            'data' => [
                'settings' => $bootstrapSettings,
                'categories' => CategoryResource::collection($categories),
                'cities' => CityResource::collection($cities),
                'pages' => StaticPageSummaryResource::collection($pages),
            ],
            'meta' => [
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
