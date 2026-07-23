<?php

use App\Models\SystemSetting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $definition = config('palverse.settings.defaults.financial.representative_commission_amount', [
            'value' => '100.00',
            'type' => 'decimal',
            'is_public' => false,
            'description_ar' => 'قيمة عمولة المندوب عن كل متجر معتمد',
            'description_en' => 'Commission amount per approved store',
        ]);

        SystemSetting::firstOrCreate(
            [
                'group' => 'financial',
                'key' => 'representative_commission_amount',
            ],
            [
                'value' => $definition['value'] ?? '100.00',
                'type' => $definition['type'] ?? 'decimal',
                'is_public' => (bool) ($definition['is_public'] ?? false),
                'description_ar' => $definition['description_ar'] ?? null,
                'description_en' => $definition['description_en'] ?? null,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep the setting; removing it would break commission screens again.
    }
};
