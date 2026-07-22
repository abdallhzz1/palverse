<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('store_registration_requests', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('representative_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->restrictOnDelete();
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            
            $table->string('proposed_merchant_name');
            $table->string('proposed_merchant_phone', 30);
            $table->string('proposed_merchant_email')->nullable();
            
            $table->string('store_name_ar');
            $table->string('store_name_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->string('phone', 30);
            $table->string('whatsapp', 30)->nullable();
            $table->string('address_ar', 500);
            $table->string('address_en', 500)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            
            $table->string('status', 20)->default('draft')->index();
            $table->text('representative_notes')->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            
            $table->foreignId('resulting_merchant_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resulting_store_id')->nullable()->constrained('stores')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['representative_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('store_registration_requests');
    }
};
