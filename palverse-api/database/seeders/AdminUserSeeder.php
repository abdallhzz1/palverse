<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            [
                'email' => env('ADMIN_EMAIL', 'admin@palverse.local'),
            ],
            [
                'name' => env('ADMIN_NAME', 'Palverse Admin'),
                'phone' => env('ADMIN_PHONE'),
                'password' => env('ADMIN_PASSWORD', 'ChangeMe123!'),
                'preferred_locale' => 'ar',
                'status' => UserStatus::Active,
            ],
        );

        $admin->syncRoles(['admin']);
    }
}
