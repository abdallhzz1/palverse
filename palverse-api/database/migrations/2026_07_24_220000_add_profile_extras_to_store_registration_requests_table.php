<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_registration_requests', function (Blueprint $table) {
            $table->json('working_hours')->nullable()->after('representative_notes');
            $table->json('social_links')->nullable()->after('working_hours');
            $table->json('draft_media')->nullable()->after('social_links');
        });
    }

    public function down(): void
    {
        Schema::table('store_registration_requests', function (Blueprint $table) {
            $table->dropColumn(['working_hours', 'social_links', 'draft_media']);
        });
    }
};
