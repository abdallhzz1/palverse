<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('collection_receipts', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->string('receipt_number')->unique();
            
            $table->foreignId('representative_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->foreignId('store_registration_request_id')->nullable()->constrained('store_registration_requests')->nullOnDelete();
            
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('ILS');
            $table->string('payment_purpose', 50)->default('subscription');
            $table->timestamp('collected_at');
            $table->text('notes')->nullable();
            
            $table->string('status', 20)->default('issued')->index();
            $table->foreignId('issued_by')->constrained('users')->restrictOnDelete();
            
            $table->timestamp('settled_at')->nullable();
            $table->foreignId('settled_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['representative_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('collection_receipts');
    }
};
