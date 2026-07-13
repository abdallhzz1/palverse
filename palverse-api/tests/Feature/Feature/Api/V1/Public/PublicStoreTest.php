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
        Store::factory()->approved()->active()->count(2)->create();
        Store::factory()->pending()->create(); // should be hidden
        Store::factory()->rejected()->create(); // should be hidden
        Store::factory()->approved()->inactive()->create(); // should be hidden

        $this->getJson('/api/v1/stores')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_guest_can_view_store_by_slug(): void
    {
        $store = Store::factory()->approved()->active()->create([
            'slug' => 'test-store',
        ]);

        $this->getJson('/api/v1/stores/test-store')
            ->assertOk()
            ->assertJsonPath('data.slug', 'test-store');
    }

    public function test_missing_store_returns_404(): void
    {
        $this->getJson('/api/v1/stores/non-existent-store')
            ->assertNotFound();
    }

    public function test_inactive_store_slug_returns_404(): void
    {
        $store = Store::factory()->approved()->inactive()->create([
            'slug' => 'test-store',
        ]);

        $this->getJson('/api/v1/stores/test-store')
            ->assertNotFound();
    }

    public function test_filters_work(): void
    {
        $cat1 = Category::factory()->create(['slug' => 'cat1']);
        $cat2 = Category::factory()->create(['slug' => 'cat2']);

        $city1 = City::factory()->create();
        $city2 = City::factory()->create();

        Store::factory()->approved()->active()->create(['category_id' => $cat1->id, 'city_id' => $city1->id]);
        Store::factory()->approved()->active()->create(['category_id' => $cat2->id, 'city_id' => $city2->id]);

        $this->getJson('/api/v1/stores?category=cat1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson("/api/v1/stores?city={$city2->public_id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
