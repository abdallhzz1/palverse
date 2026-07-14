<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Run the database seeds for a production environment safely.
     */
    public function run(): void
    {
        // 1. Roles and Permissions (Idempotent: uses firstOrCreate internally in Spatie)
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Subscription Plans (Idempotent: uses firstOrCreate or similar)
        $this->call(SubscriptionPlanSeeder::class);

        // 3. System Settings (Idempotent: uses firstOrCreate)
        $this->call(SystemSettingSeeder::class);

        // 4. Static Pages (Idempotent: uses firstOrCreate)
        $this->call(StaticPageSeeder::class);

        // NOTE: We do NOT call AdminUserSeeder. Production admins must be created explicitly
        // using the secure `php artisan palverse:create-admin` interactive command.

        // NOTE: We do NOT call DemoDataSeeder in production.
    }
}
