<?php

namespace Tests\Feature\Api\V1\Merchant;

use App\Models\Offer;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MerchantOfferTest extends TestCase
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

        $this->store = Store::factory()->withSubscription()->create([
            'owner_id' => $this->merchant->id,
            'name_en' => 'Store 1',
            'status' => 'approved',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_merchant_offer_routes()
    {
        $response = $this->getJson("/api/v1/merchant/stores/{$this->store->public_id}/offers");
        $response->assertStatus(401);
    }

    public function test_merchant_can_list_offers_for_owned_store()
    {
        Offer::factory()->count(3)->create([
            'store_id' => $this->store->id,
        ]);

        $response = $this->actingAs($this->merchant)->getJson("/api/v1/merchant/stores/{$this->store->public_id}/offers");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['public_id', 'title_ar']]]);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_merchant_cannot_list_offers_for_another_merchants_store()
    {
        $otherMerchant = User::factory()->create();
        $otherMerchant->assignRole('merchant');

        $otherStore = Store::factory()->create([
            'owner_id' => $otherMerchant->id,
        ]);

        $response = $this->actingAs($this->merchant)->getJson("/api/v1/merchant/stores/{$otherStore->public_id}/offers");
        $response->assertStatus(403);
    }

    public function test_merchant_can_create_offer()
    {
        $data = [
            'title_ar' => 'عرض خاص',
            'title_en' => 'Special Offer',
            'price' => 50,
            'old_price' => 100,
        ];

        $response = $this->actingAs($this->merchant)->postJson("/api/v1/merchant/stores/{$this->store->public_id}/offers", $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.title_ar', 'عرض خاص')
            ->assertJsonPath('data.price', '50.00')
            ->assertJsonPath('data.old_price', '100.00')
            ->assertJsonPath('data.currency', 'ILS');

        $this->assertDatabaseHas('offers', [
            'store_id' => $this->store->id,
            'title_ar' => 'عرض خاص',
        ]);
    }

    public function test_old_price_cannot_be_lower_than_price()
    {
        $data = [
            'title_ar' => 'عرض خاص',
            'price' => 100,
            'old_price' => 50,
        ];

        $response = $this->actingAs($this->merchant)->postJson("/api/v1/merchant/stores/{$this->store->public_id}/offers", $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['old_price']);
    }

    public function test_merchant_can_create_offer_with_image()
    {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('offer.jpg', 600, 600);

        $data = [
            'title_ar' => 'عرض مع صورة',
            'image' => $image,
        ];

        $response = $this->actingAs($this->merchant)->postJson("/api/v1/merchant/stores/{$this->store->public_id}/offers", $data);

        $response->assertStatus(201);
        $this->assertNotNull($response->json('data.image_url'));

        $offer = Offer::where('public_id', $response->json('data.public_id'))->first();
        Storage::disk('public')->assertExists($offer->image_path);
    }

    public function test_invalid_image_type_is_rejected()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $data = [
            'title_ar' => 'عرض',
            'image' => $file,
        ];

        $response = $this->actingAs($this->merchant)->postJson("/api/v1/merchant/stores/{$this->store->public_id}/offers", $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_merchant_can_update_offer()
    {
        $offer = Offer::factory()->create([
            'store_id' => $this->store->id,
            'title_ar' => 'قديم',
        ]);

        $data = [
            'title_ar' => 'جديد',
        ];

        $response = $this->actingAs($this->merchant)->putJson("/api/v1/merchant/stores/{$this->store->public_id}/offers/{$offer->public_id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.title_ar', 'جديد');

        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'title_ar' => 'جديد',
        ]);
    }

    public function test_merchant_can_delete_offer_and_removes_physical_image()
    {
        Storage::fake('public');

        $offer = Offer::factory()->create([
            'store_id' => $this->store->id,
            'image_path' => 'offers/test.jpg',
            'image_disk' => 'public',
        ]);

        Storage::disk('public')->put('offers/test.jpg', 'fake content');

        $response = $this->actingAs($this->merchant)->deleteJson("/api/v1/merchant/stores/{$this->store->public_id}/offers/{$offer->public_id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('offers', ['id' => $offer->id]);
        Storage::disk('public')->assertMissing('offers/test.jpg');
    }
}
