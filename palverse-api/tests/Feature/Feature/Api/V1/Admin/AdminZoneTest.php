<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\City;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminZoneTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    private function actingAsAdmin(): static
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    // ─── ADM-22: List zones ────────────────────────────────────────────────────

    public function test_admin_can_list_zones(): void
    {
        Zone::factory()->count(3)->create();

        $this->actingAsAdmin()
            ->getJson('/api/v1/admin/zones')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_filter_zones_by_city(): void
    {
        $city1 = City::factory()->create();
        $city2 = City::factory()->create();

        Zone::factory()->forCity($city1)->count(2)->create();
        Zone::factory()->forCity($city2)->count(3)->create();

        $response = $this->actingAsAdmin()
            ->getJson("/api/v1/admin/zones?city={$city1->public_id}");

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_guest_cannot_access_admin_zones(): void
    {
        $this->getJson('/api/v1/admin/zones')
            ->assertUnauthorized();
    }

    // ─── ADM-23: Create zone ───────────────────────────────────────────────────

    public function test_admin_can_create_zone(): void
    {
        $city = City::factory()->create();

        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/zones', [
                'city_id' => $city->id,
                'name_ar' => 'الماسيون',
                'name_en' => 'Al-Masyoun',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name_ar', 'الماسيون')
            ->assertJsonPath('data.name_en', 'Al-Masyoun');

        $this->assertDatabaseHas('zones', [
            'name_ar' => 'الماسيون',
            'city_id' => $city->id,
        ]);
    }

    public function test_create_zone_requires_city_id_and_name_ar(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/zones', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['city_id', 'name_ar']);
    }

    public function test_create_zone_rejects_invalid_city_id(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/zones', [
                'city_id' => 9999,
                'name_ar' => 'منطقة',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['city_id']);
    }

    public function test_create_zone_rejects_duplicate_name_ar_in_same_city(): void
    {
        $city = City::factory()->create();
        Zone::factory()->forCity($city)->create(['name_ar' => 'الماسيون']);

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/zones', [
                'city_id' => $city->id,
                'name_ar' => 'الماسيون',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name_ar']);
    }

    public function test_same_zone_name_ar_can_exist_in_different_cities(): void
    {
        $city1 = City::factory()->create();
        $city2 = City::factory()->create();

        Zone::factory()->forCity($city1)->create(['name_ar' => 'الماسيون']);

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/zones', [
                'city_id' => $city2->id,
                'name_ar' => 'الماسيون',
            ])
            ->assertCreated();
    }

    // ─── ADM-24: Show zone ─────────────────────────────────────────────────────

    public function test_admin_can_view_zone_by_public_id(): void
    {
        $zone = Zone::factory()->create();

        $this->actingAsAdmin()
            ->getJson("/api/v1/admin/zones/{$zone->public_id}")
            ->assertOk()
            ->assertJsonPath('data.public_id', $zone->public_id);
    }

    // ─── ADM-25: Update zone ───────────────────────────────────────────────────

    public function test_admin_can_update_zone_name(): void
    {
        $zone = Zone::factory()->create(['name_en' => 'Old Name']);

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/zones/{$zone->public_id}", ['name_en' => 'New Name'])
            ->assertOk()
            ->assertJsonPath('data.name_en', 'New Name');
    }

    // ─── ADM-26: Delete zone ───────────────────────────────────────────────────

    public function test_admin_can_delete_zone(): void
    {
        $zone = Zone::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/zones/{$zone->public_id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('zones', ['id' => $zone->id]);
    }

    public function test_zone_does_not_expose_internal_id(): void
    {
        $zone = Zone::factory()->create();

        $response = $this->actingAsAdmin()
            ->getJson("/api/v1/admin/zones/{$zone->public_id}");

        $data = $response->json('data');
        $this->assertArrayNotHasKey('id', $data);
        $this->assertArrayNotHasKey('city_id', $data);
    }
}
