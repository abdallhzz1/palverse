<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();

            $table->ulid('public_id')->after('id')->unique();
            $table->foreignId('owner_id')->after('public_id')->constrained('users')->restrictOnDelete();

            $table->foreignId('city_id')->after('category_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('zone_id')->after('city_id')->constrained('zones')->restrictOnDelete();

            $table->string('name_ar')->after('zone_id');
            $table->string('name_en')->nullable()->after('name_ar');
            $table->string('slug')->nullable()->unique()->after('name_en');

            $table->text('description_ar')->after('slug');
            $table->text('description_en')->nullable()->after('description_ar');

            $table->string('phone', 30)->after('description_en');
            $table->string('whatsapp', 30)->nullable()->after('phone');
            $table->string('website', 2048)->nullable()->after('whatsapp');
            $table->string('email')->nullable()->after('website');

            $table->string('address_ar', 500)->after('email');
            $table->string('address_en', 500)->nullable()->after('address_ar');

            $table->decimal('latitude', 10, 8)->nullable()->after('address_en');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');

            $table->string('status', 20)->default('pending')->index()->after('longitude');
            $table->boolean('is_active')->default(false)->index()->after('status');

            $table->timestamp('approved_at')->nullable()->after('is_active');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approved_at');

            $table->timestamp('rejected_at')->nullable()->after('approved_by');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete()->after('rejected_at');
            $table->text('rejection_reason')->nullable()->after('rejected_by');

            $table->softDeletes()->after('updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['zone_id']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropForeign(['category_id']);

            $table->dropColumn([
                'public_id', 'owner_id', 'city_id', 'zone_id',
                'name_ar', 'name_en', 'slug', 'description_ar', 'description_en',
                'phone', 'whatsapp', 'website', 'email', 'address_ar', 'address_en',
                'latitude', 'longitude', 'status', 'is_active',
                'approved_at', 'approved_by', 'rejected_at', 'rejected_by', 'rejection_reason',
                'deleted_at',
            ]);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });
    }
};
