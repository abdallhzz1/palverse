<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\City;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCityTest extends TestCase
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

    // ─── ADM-17: List cities ───────────────────────────────────────────────────

    public function test_admin_can_list_cities(): void
    {
        City::factory()->count(3)->create();

        $this->actingAsAdmin()
            ->getJson('/api/v1/admin/cities')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_guest_cannot_access_admin_cities(): void
    {
        $this->getJson('/api/v1/admin/cities')
            ->assertUnauthorized();
    }

    // ─── ADM-18: Create city ───────────────────────────────────────────────────

    public function test_admin_can_create_city(): void
    {
        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/cities', [
                'name_ar' => 'رام الله',
                'name_en' => 'Ramallah',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name_ar', 'رام الله')
            ->assertJsonPath('data.name_en', 'Ramallah');

        $this->assertDatabaseHas('cities', ['name_ar' => 'رام الله']);
    }

    public function test_create_city_requires_name_ar(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/cities', ['name_en' => 'Ramallah'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name_ar']);
    }

    public function test_create_city_rejects_duplicate_name_ar(): void
    {
        City::factory()->create(['name_ar' => 'رام الله']);

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/cities', ['name_ar' => 'رام الله'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name_ar']);
    }

    public function test_city_public_id_is_assigned_on_creation(): void
    {
        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/cities', ['name_ar' => 'القدس']);

        $publicId = $response->json('data.public_id');
        $this->assertNotEmpty($publicId);
        $this->assertDatabaseHas('cities', ['public_id' => $publicId]);
    }

    // ─── ADM-19: Show city ─────────────────────────────────────────────────────

    public function test_admin_can_view_city_by_public_id(): void
    {
        $city = City::factory()->create();

        $this->actingAsAdmin()
            ->getJson("/api/v1/admin/cities/{$city->public_id}")
            ->assertOk()
            ->assertJsonPath('data.public_id', $city->public_id);
    }

    // ─── ADM-20: Update city ───────────────────────────────────────────────────

    public function test_admin_can_update_city(): void
    {
        $city = City::factory()->create(['name_en' => 'Old']);

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/cities/{$city->public_id}", ['name_en' => 'New'])
            ->assertOk()
            ->assertJsonPath('data.name_en', 'New');
    }

    // ─── ADM-21: Delete city ───────────────────────────────────────────────────

    public function test_admin_can_delete_city(): void
    {
        $city = City::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/cities/{$city->public_id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('cities', ['id' => $city->id]);
    }

    public function test_deleting_city_with_zones_returns_409(): void
    {
        $city = City::factory()->create();
        Zone::factory()->forCity($city)->count(2)->create();

        $this->assertDatabaseCount('zones', 2);

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/cities/{$city->public_id}")
            ->assertConflict()
            ->assertJsonPath('error.code', 'CITY_HAS_ZONES');

        $this->assertDatabaseCount('zones', 2);
        $this->assertDatabaseHas('cities', ['id' => $city->id]);
    }

    // ─── Nested: zones under city ──────────────────────────────────────────────

    public function test_admin_can_list_zones_for_city(): void
    {
        $city = City::factory()->create();
        Zone::factory()->forCity($city)->count(2)->create();

        $this->actingAsAdmin()
            ->getJson("/api/v1/admin/cities/{$city->public_id}/zones")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
