<?php

use App\Enums\StaticPageType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            $table->string('page_type', 32)->default(StaticPageType::Content->value)->after('slug');
            $table->json('meta')->nullable()->after('seo_description_en');
        });

        $contactMeta = json_encode(\App\Support\StaticPageMeta::defaultContactMeta(), JSON_UNESCAPED_UNICODE);

        DB::table('static_pages')
            ->whereIn('slug', ['contact', 'contact-us'])
            ->update([
                'page_type' => StaticPageType::Contact->value,
                'meta' => $contactMeta,
            ]);
    }

    public function down(): void
    {
        Schema::table('static_pages', function (Blueprint $table) {
            $table->dropColumn(['page_type', 'meta']);
        });
    }
};
