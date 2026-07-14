<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\PublicReferenceCacheService;
use App\Services\SystemSettingService;
use Illuminate\Http\JsonResponse;

class SystemSettingController extends Controller
{
    protected SystemSettingService $settingsService;

    protected PublicReferenceCacheService $cacheService;

    public function __construct(SystemSettingService $settingsService, PublicReferenceCacheService $cacheService)
    {
        $this->settingsService = $settingsService;
        $this->cacheService = $cacheService;
    }

    /**
     * Get all public settings.
     */
    public function index(): JsonResponse
    {
        $settings = $this->cacheService->remember('settings', [], function () {
            return $this->settingsService->getPublicSettings();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الإعدادات بنجاح.',
            'data' => $settings,
            'meta' => [],
        ]);
    }

    /**
     * Get public settings for a group.
     */
    public function show(string $group): JsonResponse
    {
        $settings = $this->cacheService->remember('settings', [], function () {
            return $this->settingsService->getPublicSettings();
        });

        if (! isset($settings[$group])) {
            return response()->json([
                'success' => true,
                'message' => 'المجموعة المطلوبة فارغة أو غير موجودة.',
                'data' => [],
                'meta' => [],
            ], 200);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب إعدادات المجموعة بنجاح.',
            'data' => $settings[$group],
            'meta' => [],
        ]);
    }
}
