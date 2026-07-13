<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table): void {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('city_id')
                ->constrained('cities')
                ->cascadeOnDelete();
            $table->string('name_ar', 191);
            $table->string('name_en', 191)->nullable();
            $table->timestamps();

            // Enforce uniqueness per city
            $table->unique(['city_id', 'name_ar']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
