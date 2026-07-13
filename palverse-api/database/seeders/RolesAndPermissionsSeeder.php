<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.manage',

            'stores.view',
            'stores.create',
            'stores.update',
            'stores.approve',
            'stores.reject',
            'stores.activate',
            'stores.deactivate',

            'categories.view',
            'categories.manage',

            'cities.view',
            'cities.manage',

            'zones.view',
            'zones.manage',

            'offers.view',
            'offers.manage',

            'subscriptions.view',
            'subscriptions.manage',

            'settings.view',
            'settings.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $merchant = Role::firstOrCreate([
            'name' => 'merchant',
            'guard_name' => 'web',
        ]);

        Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions(Permission::all());

        $merchant->syncPermissions([
            'stores.view',
            'stores.create',
            'stores.update',
            'offers.view',
            'offers.manage',
            'subscriptions.view',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
