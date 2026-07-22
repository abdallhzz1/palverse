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

            'articles.manage',

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

            'audit_logs.view',

            'representative.dashboard.view',
            'representative.zones.view',
            'store_requests.view_own',
            'store_requests.create',
            'store_requests.update_own',
            'store_requests.submit_own',
            'refusal_reports.view_own',
            'refusal_reports.create',
            'commissions.view_own',
            'receipts.view_own',
            'receipts.create',
            'cash_balance.view_own',
            'representatives.manage',
            'store_requests.manage',
            'commissions.manage',
            'receipts.manage',

            'follow_up.dashboard.view',
            'store_requests.view',
            'store_requests.review',
            'store_requests.approve',
            'store_requests.reject',
            'store_requests.request_changes',
            'renewals.view',
            'renewals.follow_up',
            'unpaid_subscriptions.view',
            'merchants.contact',
            'follow_up_calls.view_own',
            'follow_up_calls.create',
            'follow_up_calls.update_own',
            'representatives.view',
            'representatives.activity.view',
            'notifications.send_operational',
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

        // Deprecated: Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        $representative = Role::firstOrCreate([
            'name' => 'representative',
            'guard_name' => 'web',
        ]);

        $representative->syncPermissions([
            'representative.dashboard.view',
            'representative.zones.view',
            'store_requests.view_own',
            'store_requests.create',
            'store_requests.update_own',
            'store_requests.submit_own',
            'refusal_reports.view_own',
            'refusal_reports.create',
            'commissions.view_own',
            'receipts.view_own',
            'receipts.create',
            'cash_balance.view_own',
        ]);

        $followUp = Role::firstOrCreate([
            'name' => 'follow_up',
            'guard_name' => 'web',
        ]);

        $followUp->syncPermissions([
            'follow_up.dashboard.view',
            'store_requests.view',
            'store_requests.review',
            'store_requests.approve',
            'store_requests.reject',
            'store_requests.request_changes',
            'renewals.view',
            'renewals.follow_up',
            'unpaid_subscriptions.view',
            'merchants.contact',
            'follow_up_calls.view_own',
            'follow_up_calls.create',
            'follow_up_calls.update_own',
            'representatives.view',
            'representatives.activity.view',
            'notifications.send_operational',
            'articles.manage',
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
