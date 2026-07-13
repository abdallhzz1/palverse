<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SystemSettingService
{
    /**
     * Get a setting by group and key.
     */
    public function get(string $group, string $key)
    {
        $setting = SystemSetting::where('group', $group)->where('key', $key)->first();

        return $setting ? $setting->castValue() : null;
    }

    /**
     * Get public settings grouped by group with caching.
     */
    public function getPublicSettings(): array
    {
        return Cache::remember('palverse.public_settings', 300, function () {
            $settings = SystemSetting::public()->get();
            $grouped = [];
            foreach ($settings as $setting) {
                $grouped[$setting->group][$setting->key] = $setting->castValue();
            }

            return $grouped;
        });
    }

    /**
     * Update multiple settings atomically.
     */
    public function updateSettings(array $settingsData): void
    {
        DB::transaction(function () use ($settingsData) {
            $whitelist = config('palverse.settings.whitelisted_keys', []);

            foreach ($settingsData as $group => $keys) {
                if (! isset($whitelist[$group])) {
                    throw new \InvalidArgumentException("المجموعة غير صالحة: {$group}");
                }

                if (! is_array($keys)) {
                    continue;
                }

                foreach ($keys as $key => $value) {
                    if (! in_array($key, $whitelist[$group])) {
                        throw new \InvalidArgumentException("المفتاح غير صالح: {$key} في المجموعة: {$group}");
                    }

                    $setting = SystemSetting::where('group', $group)->where('key', $key)->first();
                    if ($setting) {
                        $this->validateSettingValue($value, $setting->type);
                        $setting->setTypedValue($value);
                        $setting->save();
                    }
                }
            }

            // Invalidate cache on update
            Cache::forget('palverse.public_settings');
        });
    }

    /**
     * Validate value format based on type.
     */
    protected function validateSettingValue($value, string $type): void
    {
        if (is_null($value)) {
            return;
        }

        switch ($type) {
            case 'email':
                if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    throw new \InvalidArgumentException('صيغة البريد الإلكتروني غير صالحة.');
                }
                break;
            case 'url':
                if (! filter_var($value, FILTER_VALIDATE_URL)) {
                    throw new \InvalidArgumentException('صيغة الرابط (URL) غير صالحة.');
                }
                break;
            case 'integer':
                if (! is_numeric($value) || intval($value) != $value) {
                    throw new \InvalidArgumentException('القيمة يجب أن تكون رقماً صحيحاً.');
                }
                break;
            case 'decimal':
                if (! is_numeric($value)) {
                    throw new \InvalidArgumentException('القيمة يجب أن تكون رقماً عشرياً.');
                }
                break;
            case 'boolean':
                if (! is_bool($value) && ! in_array(strtolower((string) $value), ['true', 'false', '1', '0', 'yes', 'no'])) {
                    throw new \InvalidArgumentException('القيمة يجب أن تكون منطقية (true/false).');
                }
                break;
        }
    }
}
