<?php

use App\Enums\UserStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->ulid('public_id')->unique()->after('id');
            $table->string('phone', 30)->nullable()->unique()->after('email');
            $table->string('preferred_locale', 5)->default('ar')->after('phone');
            $table->string('status', 20)
                ->default(UserStatus::Active->value)
                ->index()
                ->after('preferred_locale');

            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['public_id']);
            $table->dropUnique(['phone']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'public_id',
                'phone',
                'preferred_locale',
                'status',
                'last_login_at',
                'deleted_at',
            ]);
        });
    }
};
