<?php

namespace Tests\Feature\Feature\Api\V1\Public;

use App\Models\Store;
use App\Models\StoreMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicStoreMediaTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_store_detail_includes_media(): void
    {
        $store = Store::factory()->approved()->active()->create([
            'slug' => 'test-store-media',
        ]);

        StoreMedia::factory()->logo()->create(['store_id' => $store->id, 'file_path' => 'logo.jpg']);
        StoreMedia::factory()->cover()->create(['store_id' => $store->id, 'file_path' => 'cover.jpg']);
        StoreMedia::factory()->gallery()->create(['store_id' => $store->id, 'file_path' => 'gal1.jpg', 'sort_order' => 1]);
        StoreMedia::factory()->gallery()->create(['store_id' => $store->id, 'file_path' => 'gal2.jpg', 'sort_order' => 2]);

        $response = $this->getJson('/api/v1/stores/test-store-media')
            ->assertOk();

        $response->assertJsonPath('data.logo.url', url('storage/logo.jpg'));
        $response->assertJsonPath('data.cover.url', url('storage/cover.jpg'));
        $this->assertCount(2, $response->json('data.gallery'));

        // original_name should NOT be exposed publicly by default
        $response->assertJsonMissingPath('data.logo.original_name');

        // internal DB IDs should NOT be exposed publicly
        $response->assertJsonMissingPath('data.logo.id');
        $response->assertJsonMissingPath('data.logo.store_id');
    }

    public function test_public_store_list_includes_logo_and_cover(): void
    {
        $store = Store::factory()->approved()->active()->create();

        StoreMedia::factory()->logo()->create(['store_id' => $store->id, 'file_path' => 'logo.jpg']);
        StoreMedia::factory()->cover()->create(['store_id' => $store->id, 'file_path' => 'cover.jpg']);

        $response = $this->getJson('/api/v1/stores')
            ->assertOk();

        $response->assertJsonPath('data.0.logo.url', url('storage/logo.jpg'));
        $response->assertJsonPath('data.0.cover.url', url('storage/cover.jpg'));
        // We do not eagerly load the full gallery on the public listing to save bandwidth, but actually
        // my query `with(['category', 'city', 'zone', 'logo', 'cover'])` currently doesn't load gallery.
        $response->assertJsonMissingPath('data.0.gallery');
    }
}
