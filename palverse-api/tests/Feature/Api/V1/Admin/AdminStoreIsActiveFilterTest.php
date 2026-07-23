<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Store;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\Support\TestSetupHelpers;
use Tests\TestCase;

class AdminStoreIsActiveFilterTest extends TestCase
{
    use RefreshDatabase;
    use TestSetupHelpers;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_admin_can_filter_stores_by_is_active_string_booleans(): void
    {
        $admin = $this->createAdminUser();
        $token = $admin->createToken('admin')->plainTextToken;

        Store::factory()->approved()->create(['is_active' => true, 'name_ar' => 'نشط']);
        Store::factory()->approved()->create(['is_active' => false, 'name_ar' => 'معطل']);

        $this->withToken($token)
            ->getJson('/api/v1/admin/stores?is_active=true')
            ->assertOk()
            ->assertJsonFragment(['name_ar' => 'نشط'])
            ->assertJsonMissing(['name_ar' => 'معطل']);

        $this->withToken($token)
            ->getJson('/api/v1/admin/stores?is_active=false')
            ->assertOk()
            ->assertJsonFragment(['name_ar' => 'معطل'])
            ->assertJsonMissing(['name_ar' => 'نشط']);

        $this->withToken($token)
            ->getJson('/api/v1/admin/stores?is_active=1')
            ->assertOk()
            ->assertJsonFragment(['name_ar' => 'نشط']);
    }
}
