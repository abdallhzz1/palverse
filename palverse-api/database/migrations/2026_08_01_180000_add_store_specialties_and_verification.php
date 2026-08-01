<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_store', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['store_id', 'category_id']);
            $table->index('category_id');
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('is_active')->index();
            $table->timestamp('verified_at')->nullable()->after('is_verified');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
        });

        // Backfill primary category into specialty pivot.
        DB::table('stores')
            ->select(['id', 'category_id'])
            ->whereNotNull('category_id')
            ->orderBy('id')
            ->chunkById(200, function ($stores): void {
                $now = now();
                $rows = [];
                foreach ($stores as $store) {
                    $rows[] = [
                        'store_id' => $store->id,
                        'category_id' => $store->category_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
                if ($rows !== []) {
                    DB::table('category_store')->insertOrIgnore($rows);
                }
            });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn(['is_verified', 'verified_at']);
        });

        Schema::dropIfExists('category_store');
    }
};
