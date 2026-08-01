<?php

use App\Enums\AdPlacement;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_advertisements', function (Blueprint $table) {
            $table->string('placement')->nullable()->after('ad_type');
            $table->index(['ad_type', 'placement', 'is_active'], 'store_ads_type_placement_active_idx');
        });

        // Existing banners were shown everywhere; pin them to the primary hero slot.
        DB::table('store_advertisements')
            ->where('ad_type', 'banner')
            ->whereNull('placement')
            ->update(['placement' => AdPlacement::HOME_HERO->value]);
    }

    public function down(): void
    {
        Schema::table('store_advertisements', function (Blueprint $table) {
            $table->dropIndex('store_ads_type_placement_active_idx');
            $table->dropColumn('placement');
        });
    }
};
