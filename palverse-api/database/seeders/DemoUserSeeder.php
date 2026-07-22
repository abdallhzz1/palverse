<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminPassword = Hash::make(config('palverse.demo.admin_password', 'DemoAdmin123!'));
        $merchantPassword = Hash::make(config('palverse.demo.merchant_password', 'DemoMerchant123!'));

        // 1. Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@palverse.demo'],
            [
                'name' => 'Palverse Demo Admin',
                'password' => $adminPassword,
                'status' => UserStatus::Active,
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        // 2. Merchants
        $merchants = [
            ['name' => 'أحمد الجعبري', 'email' => 'merchant1@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'ليان النتشة', 'email' => 'merchant2@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'محمد القواسمي', 'email' => 'merchant3@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'سارة التميمي', 'email' => 'merchant4@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'خالد الرجبي', 'email' => 'merchant5@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'نور أبو سنينة', 'email' => 'merchant6@palverse.demo', 'status' => UserStatus::Active],
            ['name' => 'يوسف المحتسب', 'email' => 'merchant7@palverse.demo', 'status' => UserStatus::Inactive],
            ['name' => 'مريم أبو عيشة', 'email' => 'merchant8@palverse.demo', 'status' => UserStatus::Suspended],
        ];

        foreach ($merchants as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $merchantPassword,
                    'status' => $data['status'],
                    'email_verified_at' => now(),
                    'phone' => '059000100' . substr($data['email'], 8, 1), // e.g., 0590001001
                ]
            );
            if (!$user->hasRole('merchant')) {
                $user->assignRole('merchant');
            }
        }

        // Customer seeding has been deprecated and removed.
    }
}
