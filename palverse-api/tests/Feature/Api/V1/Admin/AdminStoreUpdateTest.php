<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Enums\StoreStatus;
use App\Models\Store;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\Support\TestSetupHelpers;
use Tests\TestCase;

class AdminStoreUpdateTest extends TestCase
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

    public function test_admin_can_update_store_fields_and_coordinates(): void
    {
        $admin = $this->createAdminUser();
        $token = $admin->createToken('admin')->plainTextToken;
        $store = Store::factory()->approved()->create([
            'is_active' => true,
            'name_ar' => 'اسم قديم',
            'latitude' => 31.5,
            'longitude' => 35.0,
        ]);

        $this->withToken($token)
            ->putJson("/api/v1/admin/stores/{$store->public_id}", [
                'name_ar' => 'اسم محدّث',
                'latitude' => 31.5415,
                'longitude' => 35.0931,
                'address_ar' => 'الخليل',
            ])
            ->assertOk()
            ->assertJsonPath('data.name_ar', 'اسم محدّث')
            ->assertJsonPath('data.latitude', '31.54150000');

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'name_ar' => 'اسم محدّث',
            'status' => StoreStatus::APPROVED->value,
        ]);
    }
}
