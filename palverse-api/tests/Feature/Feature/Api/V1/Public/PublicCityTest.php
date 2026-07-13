<?php

namespace Tests\Feature\Api\V1\Public;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCityTest extends TestCase
{
    use RefreshDatabase;

    // ─── PUB-03: List cities ───────────────────────────────────────────────────

    public function test_guest_can_list_cities(): void
    {
        City::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/cities');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_city_list_returns_expected_fields(): void
    {
        $city = City::factory()->create([
            'name_ar' => 'رام الله',
            'name_en' => 'Ramallah',
        ]);

        $response = $this->getJson('/api/v1/cities');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'public_id' => $city->public_id,
                'name_ar' => 'رام الله',
                'name_en' => 'Ramallah',
            ]);
    }

    public function test_city_list_does_not_expose_internal_id(): void
    {
        City::factory()->create();

        $response = $this->getJson('/api/v1/cities');

        $this->assertArrayNotHasKey('id', $response->json('data.0'));
    }

    // ─── PUB-04: List zones for a city ────────────────────────────────────────

    public function test_guest_can_list_zones_for_a_city(): void
    {
        $city = City::factory()->create();
        Zone::factory()->forCity($city)->count(4)->create();

        $response = $this->getJson("/api/v1/cities/{$city->public_id}/zones");

        $response
            ->assertOk()
            ->assertJsonCount(4, 'data');
    }

    public function test_zones_belong_to_requested_city_only(): void
    {
        $city1 = City::factory()->create();
        $city2 = City::factory()->create();

        Zone::factory()->forCity($city1)->count(2)->create();
        Zone::factory()->forCity($city2)->count(3)->create();

        $response = $this->getJson("/api/v1/cities/{$city1->public_id}/zones");

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_zones_endpoint_returns_404_for_unknown_city(): void
    {
        $this->getJson('/api/v1/cities/01NONEXISTENT/zones')
            ->assertNotFound();
    }

    public function test_zone_does_not_expose_internal_id(): void
    {
        $city = City::factory()->create();
        Zone::factory()->forCity($city)->create();

        $response = $this->getJson("/api/v1/cities/{$city->public_id}/zones");

        $item = $response->json('data.0');
        $this->assertArrayNotHasKey('id', $item);
        $this->assertArrayNotHasKey('city_id', $item);
    }
}
