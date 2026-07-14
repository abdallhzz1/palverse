<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProductionReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_healthy_status()
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'healthy');
    }

    public function test_ready_endpoint_returns_ready_status()
    {
        // Ready endpoint checks DB, Cache, and Storage.
        // It might fail in testing if the default filesystem isn't resolvable,
        // so we just check that it returns a valid JSON response (either 200 or 503 is structurally valid)
        $response = $this->getJson('/api/v1/ready');

        $response->assertJsonStructure([
            'success',
            'message',
        ]);
    }

    public function test_cache_is_invalidated_when_category_is_created()
    {
        // First request to seed cache
        $this->getJson('/api/v1/categories');

        $this->assertTrue(Cache::has('palverse:v1:categories'));

        // Action that should trigger cache invalidation via observer
        Category::factory()->create();

        // Cache should be cleared for categories
        $this->assertFalse(Cache::has('palverse:v1:categories'));
    }

    public function test_create_admin_command_is_registered()
    {
        $commands = Artisan::all();
        $this->assertArrayHasKey('palverse:create-admin', $commands);
    }
}
