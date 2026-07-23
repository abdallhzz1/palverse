<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SystemSettingService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Get a setting by group and key.
     */
    public function get(string $group, string $key)
    {
        $setting = SystemSetting::where('group', $group)->where('key', $key)->first();

        return $setting ? $setting->castValue() : null;
    }

    /**
     * Whether the settings group is configured in the whitelist.
     */
    public function isValidGroup(string $group): bool
    {
        $whitelist = config('palverse.settings.whitelisted_keys', []);

        return isset($whitelist[$group]);
    }

    /**
     * Create missing default rows for a group (idempotent).
     */
    public function ensureGroupDefaults(string $group): void
    {
        $defaults = config("palverse.settings.defaults.{$group}", []);
        if (! is_array($defaults) || $defaults === []) {
            return;
        }

        foreach ($defaults as $key => $definition) {
            if (! is_array($definition)) {
                continue;
            }

            SystemSetting::firstOrCreate(
                ['group' => $group, 'key' => $key],
                [
                    'value' => $definition['value'] ?? null,
                    'type' => $definition['type'] ?? 'string',
                    'is_public' => (bool) ($definition['is_public'] ?? false),
                    'description_ar' => $definition['description_ar'] ?? null,
                    'description_en' => $definition['description_en'] ?? null,
                ]
            );
        }
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
            $changes = [];

            foreach ($settingsData as $group => $keys) {
                if (! isset($whitelist[$group])) {
                    throw new \InvalidArgumentException("المجموعة غير صالحة: {$group}");
                }

                if (! is_array($keys)) {
                    continue;
                }

                foreach ($keys as $key => $value) {
                    if (! in_array($key, $whitelist[$group], true)) {
                        throw new \InvalidArgumentException("المفتاح غير صالح: {$key} في المجموعة: {$group}");
                    }

                    $setting = SystemSetting::where('group', $group)->where('key', $key)->first();
                    if (! $setting) {
                        $definition = config("palverse.settings.defaults.{$group}.{$key}");
                        if (! is_array($definition)) {
                            throw new \InvalidArgumentException("الإعداد غير موجود: {$group}.{$key}");
                        }

                        $setting = new SystemSetting([
                            'group' => $group,
                            'key' => $key,
                            'type' => $definition['type'] ?? 'string',
                            'is_public' => (bool) ($definition['is_public'] ?? false),
                            'description_ar' => $definition['description_ar'] ?? null,
                            'description_en' => $definition['description_en'] ?? null,
                            'value' => $definition['value'] ?? null,
                        ]);
                    }

                    $this->validateSettingValue($value, $setting->type);

                    $oldVal = $setting->exists ? $setting->castValue() : null;
                    $setting->setTypedValue($value);
                    $newVal = $setting->castValue();

                    if (! $setting->exists || $oldVal !== $newVal) {
                        $setting->save();

                        $changes[] = [
                            'group' => $group,
                            'key' => $key,
                            'old' => $oldVal,
                            'new' => $newVal,
                        ];
                    }
                }
            }

            // Invalidate cache on update
            Cache::forget('palverse.public_settings');
            app(PublicReferenceCacheService::class)->invalidateDomain('settings');

            if (count($changes) > 0) {
                $oldValues = [];
                $newValues = [];
                foreach ($changes as $c) {
                    $oldValues[$c['group'].'.'.$c['key']] = $c['old'];
                    $newValues[$c['group'].'.'.$c['key']] = $c['new'];
                }

                $this->auditLogService->recordFromRequest(
                    action: AuditAction::SettingUpdated,
                    oldValues: $oldValues,
                    newValues: $newValues
                );
            }
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
