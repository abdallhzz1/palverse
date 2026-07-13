<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->char('public_id', 26)->unique();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->constrained()->restrictOnDelete();
            $table->string('status')->index();
            $table->datetime('starts_at')->index();
            $table->datetime('ends_at')->index();
            $table->datetime('activated_at')->nullable();
            $table->datetime('cancelled_at')->nullable();
            $table->datetime('expired_at')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('price_snapshot', 10, 2);
            $table->char('currency_snapshot', 3);
            $table->string('plan_name_ar_snapshot');
            $table->string('plan_name_en_snapshot')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_subscriptions');
    }
};
