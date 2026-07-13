<?php

namespace Tests\Feature\Api\V1\Public;

use App\Models\Offer;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicOfferTest extends TestCase
{
    use RefreshDatabase;

    private User $merchant;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->store = Store::factory()->approved()->withSubscription()->create([
            'slug' => 'test-store',
        ]);
    }

    public function test_guest_can_list_current_active_offers_for_public_store()
    {
        Offer::factory()->count(3)->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}/offers");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['public_id', 'title_ar']]]);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_inactive_offers_are_hidden()
    {
        Offer::factory()->inactive()->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}/offers");

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    public function test_expired_offers_are_hidden()
    {
        Offer::factory()->expired()->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}/offers");

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    public function test_future_offers_are_hidden()
    {
        Offer::factory()->scheduled()->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}/offers");

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    public function test_offers_of_inactive_store_are_hidden()
    {
        $this->store->is_active = false;
        $this->store->save();

        Offer::factory()->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}/offers");

        $response->assertStatus(404); // Because store itself isn't public visible
    }

    public function test_public_store_detail_includes_limited_current_offers()
    {
        Offer::factory()->count(10)->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->slug}");

        $response->assertStatus(200);

        $this->assertArrayHasKey('offers', $response->json('data'));
        $this->assertArrayHasKey('offers_count', $response->json('data'));

        $this->assertEquals(10, $response->json('data.offers_count'));
        $this->assertCount(5, $response->json('data.offers')); // Limited to 5
    }
}
