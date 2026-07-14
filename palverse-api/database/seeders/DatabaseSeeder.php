<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            SubscriptionPlanSeeder::class,
            SystemSettingSeeder::class,
            StaticPageSeeder::class,
        ]);

        if (config('palverse.demo.seed_enabled')) {
            $this->call(DemoDataSeeder::class);
        }
    }
}
