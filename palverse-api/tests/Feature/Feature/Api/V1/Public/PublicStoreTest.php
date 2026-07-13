<?php

namespace Tests\Feature\Feature\Api\V1\Public;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_approved_active_stores(): void
    {
        Store::factory()->approved()->active()->withSubscription()->count(2)->create();

        // These should be hidden
        Store::factory()->approved()->inactive()->withSubscription()->create(); // should be hidden
        Store::factory()->pending()->create(); // should be hidden

        $response = $this->getJson('/api/v1/stores');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['public_id', 'slug']]]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_guest_can_view_store_by_slug(): void
    {
        $store = Store::factory()->approved()->active()->withSubscription()->create([
            'slug' => 'test-store',
        ]);

        $response = $this->getJson('/api/v1/stores/test-store');

        $response->assertStatus(200)
            ->assertJsonPath('data.public_id', $store->public_id);
    }

    public function test_guest_cannot_view_unapproved_or_inactive_store(): void
    {
        Store::factory()->pending()->create(['slug' => 'pending-store']);
        $response = $this->getJson('/api/v1/stores/pending-store');
        $response->assertStatus(404);

        $store = Store::factory()->approved()->inactive()->withSubscription()->create([
            'slug' => 'inactive-store',
        ]);
        $response = $this->getJson('/api/v1/stores/inactive-store');
        $response->assertStatus(404);
    }

    public function test_filters_work(): void
    {
        $cat1 = Category::factory()->create(['slug' => 'cat1']);
        $cat2 = Category::factory()->create(['slug' => 'cat2']);

        $city1 = City::factory()->create();
        $city2 = City::factory()->create();

        Store::factory()->approved()->active()->withSubscription()->create(['category_id' => $cat1->id, 'city_id' => $city1->id]);
        Store::factory()->approved()->active()->withSubscription()->create(['category_id' => $cat2->id, 'city_id' => $city2->id]);

        $this->getJson('/api/v1/stores?category=cat1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson("/api/v1/stores?city={$city2->public_id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
