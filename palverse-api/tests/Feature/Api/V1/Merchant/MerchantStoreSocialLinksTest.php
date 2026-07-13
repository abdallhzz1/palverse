<?php

namespace Tests\Feature\Api\V1\Merchant;

use App\Models\Store;
use App\Models\StoreSocialLink;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantStoreSocialLinksTest extends TestCase
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

        $this->store = Store::factory()->create([
            'owner_id' => $this->merchant->id,
        ]);
    }

    public function test_guest_cannot_access_social_links_endpoints()
    {
        $this->getJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links")
            ->assertUnauthorized();
    }

    public function test_merchant_can_list_social_links_for_owned_store()
    {
        StoreSocialLink::factory()->count(2)->create(['store_id' => $this->store->id]);

        $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links")
            ->assertSuccessful()
            ->assertJsonCount(2, 'data');
    }

    public function test_merchant_can_create_facebook_link()
    {
        $payload = [
            'platform' => 'facebook',
            'url' => 'https://facebook.com/mystore',
            'username' => 'mystore',
            'is_active' => true,
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links", $payload)
            ->assertCreated()
            ->assertJsonPath('data.platform', 'facebook');

        $this->assertDatabaseHas('store_social_links', [
            'store_id' => $this->store->id,
            'platform' => 'facebook',
            'url' => 'https://facebook.com/mystore',
        ]);
    }

    public function test_invalid_platform_is_rejected()
    {
        $payload = [
            'platform' => 'invalid_platform',
            'url' => 'https://test.com',
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links", $payload)
            ->assertJsonValidationErrors(['platform']);
    }

    public function test_invalid_url_is_rejected()
    {
        $payload = [
            'platform' => 'facebook',
            'url' => 'not-a-url',
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links", $payload)
            ->assertJsonValidationErrors(['url']);
    }

    public function test_duplicate_active_platform_is_rejected()
    {
        StoreSocialLink::factory()->facebook()->create(['store_id' => $this->store->id, 'is_active' => true]);

        $payload = [
            'platform' => 'facebook',
            'url' => 'https://facebook.com/new',
            'is_active' => true,
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links", $payload)
            ->assertStatus(409)
            ->assertJsonPath('error.code', 'SOCIAL_LINK_CONFLICT');
    }

    public function test_merchant_can_update_owned_social_link()
    {
        $link = StoreSocialLink::factory()->facebook()->create(['store_id' => $this->store->id]);

        $payload = [
            'url' => 'https://facebook.com/updated',
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links/{$link->public_id}", $payload)
            ->assertSuccessful()
            ->assertJsonPath('data.url', 'https://facebook.com/updated');
    }

    public function test_merchant_cannot_update_another_stores_social_link()
    {
        $otherStore = Store::factory()->create();
        $link = StoreSocialLink::factory()->facebook()->create(['store_id' => $otherStore->id]);

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links/{$link->public_id}", ['url' => 'https://test.com'])
            ->assertNotFound(); // Because it's not under their store context
    }

    public function test_merchant_can_delete_social_link()
    {
        $link = StoreSocialLink::factory()->facebook()->create(['store_id' => $this->store->id]);

        $this->actingAs($this->merchant)
            ->deleteJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links/{$link->public_id}")
            ->assertSuccessful();

        $this->assertSoftDeleted('store_social_links', ['id' => $link->id]);
    }

    public function test_no_numeric_ids_are_exposed()
    {
        StoreSocialLink::factory()->facebook()->create(['store_id' => $this->store->id]);

        $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/social-links")
            ->assertSuccessful()
            ->assertJsonMissing(['id' => 1]) // Assuming it's the first ID
            ->assertJsonMissing(['store_id' => $this->store->id]);
    }
}
