<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Offer;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOfferTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $merchant;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->store = Store::factory()->create([
            'owner_id' => $this->merchant->id,
            'status' => 'approved',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_admin_offers()
    {
        $response = $this->getJson('/api/v1/admin/offers');
        $response->assertStatus(401);
    }

    public function test_merchant_cannot_access_admin_offers()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/v1/admin/offers');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_offers()
    {
        Offer::factory()->count(3)->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/v1/admin/offers');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['public_id', 'title_ar']]]);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_deactivate_offer()
    {
        $offer = Offer::factory()->create([
            'store_id' => $this->store->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/offers/{$offer->public_id}/deactivate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_activate_offer()
    {
        $offer = Offer::factory()->create([
            'store_id' => $this->store->id,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/offers/{$offer->public_id}/activate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'is_active' => true,
        ]);
    }
}
