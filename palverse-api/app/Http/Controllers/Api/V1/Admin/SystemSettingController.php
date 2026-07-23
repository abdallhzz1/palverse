<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateSystemSettingsRequest;
use App\Models\SystemSetting;
use App\Services\SystemSettingService;
use Illuminate\Http\JsonResponse;

class SystemSettingController extends Controller
{
    protected SystemSettingService $settingsService;

    public function __construct(SystemSettingService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get all settings grouped.
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all();
        $grouped = [];
        foreach ($settings as $setting) {
            $grouped[$setting->group][$setting->key] = [
                'public_id' => $setting->public_id,
                'value' => $setting->castValue(),
                'type' => $setting->type,
                'is_public' => $setting->is_public,
                'description_ar' => $setting->description_ar,
                'description_en' => $setting->description_en,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الإعدادات بنجاح.',
            'data' => $grouped,
            'meta' => [],
        ]);
    }

    /**
     * Get settings for a specific group.
     */
    public function show(string $group): JsonResponse
    {
        if (! $this->settingsService->isValidGroup($group)) {
            return response()->json([
                'success' => false,
                'message' => 'المجموعة غير موجودة.',
            ], 404);
        }

        $this->settingsService->ensureGroupDefaults($group);

        $settings = SystemSetting::group($group)->get();
        $list = [];
        foreach ($settings as $setting) {
            $list[$setting->key] = [
                'public_id' => $setting->public_id,
                'value' => $setting->castValue(),
                'type' => $setting->type,
                'is_public' => $setting->is_public,
                'description_ar' => $setting->description_ar,
                'description_en' => $setting->description_en,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب إعدادات المجموعة بنجاح.',
            'data' => $list,
            'meta' => [],
        ]);
    }

    /**
     * Update multiple settings.
     */
    public function update(UpdateSystemSettingsRequest $request): JsonResponse
    {
        try {
            $this->settingsService->updateSettings($request->input('settings'));
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل التحديث: '.$e->getMessage(),
                'errors' => [
                    'settings' => [$e->getMessage()],
                ],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإعدادات بنجاح.',
            'data' => [],
            'meta' => [],
        ]);
    }

    /**
     * Update settings in a specific group.
     */
    public function updateGroup(UpdateSystemSettingsRequest $request, string $group): JsonResponse
    {
        try {
            $settingsData = [$group => $request->input('settings')];
            $this->settingsService->updateSettings($settingsData);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل التحديث: '.$e->getMessage(),
                'errors' => [
                    'settings' => [$e->getMessage()],
                ],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث إعدادات المجموعة بنجاح.',
            'data' => [],
            'meta' => [],
        ]);
    }
}
