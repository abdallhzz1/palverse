<?php

namespace Tests\Feature\Feature\Api\V1\Merchant;

use App\Models\Store;
use App\Models\StoreMedia;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MerchantStoreMediaTest extends TestCase
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

        Storage::fake('public');
    }

    public function test_merchant_can_upload_logo(): void
    {
        $file = UploadedFile::fake()->image('logo.jpg', 200, 200);

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/logo", [
                'file' => $file,
            ])
            ->assertOk()
            ->assertJsonPath('data.type', 'logo');

        $this->assertDatabaseCount('store_media', 1);

        $media = StoreMedia::first();
        Storage::disk('public')->assertExists($media->file_path);
    }

    public function test_uploading_new_logo_replaces_old_logo(): void
    {
        $oldFile = UploadedFile::fake()->image('old.jpg');
        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/logo", ['file' => $oldFile]);

        $oldMedia = StoreMedia::first();

        $newFile = UploadedFile::fake()->image('new.jpg');
        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/logo", ['file' => $newFile])
            ->assertOk();

        $this->assertDatabaseCount('store_media', 2);
        $this->assertSoftDeleted('store_media', ['id' => $oldMedia->id]);

        // Physical file deletion on soft delete is not strictly required by the prompt,
        // but if we used an observer on `deleted`, we could assert it's gone.
        // Actually, my model observer uses `forceDeleted`. Let's test force delete logic.
        $oldMedia->forceDelete();
        Storage::disk('public')->assertMissing($oldMedia->file_path);
    }

    public function test_merchant_can_delete_logo(): void
    {
        $file = UploadedFile::fake()->image('logo.jpg');
        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/logo", ['file' => $file]);

        $this->actingAs($this->merchant)
            ->deleteJson("/api/v1/merchant/stores/{$this->store->public_id}/logo")
            ->assertNoContent();

        $this->assertSoftDeleted('store_media', ['type' => 'logo']);
    }

    public function test_merchant_cannot_upload_logo_to_others_store(): void
    {
        $otherMerchant = User::factory()->create();
        $otherMerchant->assignRole('merchant');

        $otherStore = Store::factory()->create(['owner_id' => $otherMerchant->id]);

        $file = UploadedFile::fake()->image('logo.jpg');

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$otherStore->public_id}/logo", ['file' => $file])
            ->assertForbidden();
    }

    public function test_upload_cover(): void
    {
        $file = UploadedFile::fake()->image('cover.jpg', 800, 400);

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/cover", [
                'file' => $file,
            ])
            ->assertOk()
            ->assertJsonPath('data.type', 'cover');

        $this->assertDatabaseHas('store_media', ['type' => 'cover']);
    }

    public function test_upload_gallery_images(): void
    {
        $files = [
            UploadedFile::fake()->image('1.jpg'),
            UploadedFile::fake()->image('2.jpg'),
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/gallery", [
                'files' => $files,
            ])
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertDatabaseCount('store_media', 2);
    }

    public function test_gallery_limit_is_enforced(): void
    {
        // Limit is 10 by default
        StoreMedia::factory()->gallery()->count(9)->create([
            'store_id' => $this->store->id,
        ]);

        $files = [
            UploadedFile::fake()->image('1.jpg'),
            UploadedFile::fake()->image('2.jpg'), // Will exceed 10
        ];

        $this->actingAs($this->merchant)
            ->postJson("/api/v1/merchant/stores/{$this->store->public_id}/gallery", [
                'files' => $files,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'GALLERY_UPLOAD_ERROR');

        // Should still only have 9
        $this->assertDatabaseCount('store_media', 9);
    }

    public function test_merchant_can_delete_gallery_image(): void
    {
        $media = StoreMedia::factory()->gallery()->create([
            'store_id' => $this->store->id,
        ]);

        $this->actingAs($this->merchant)
            ->deleteJson("/api/v1/merchant/stores/{$this->store->public_id}/gallery/{$media->public_id}")
            ->assertNoContent();

        $this->assertSoftDeleted('store_media', ['id' => $media->id]);
    }

    public function test_merchant_can_reorder_gallery(): void
    {
        $media1 = StoreMedia::factory()->gallery()->create(['store_id' => $this->store->id, 'sort_order' => 1]);
        $media2 = StoreMedia::factory()->gallery()->create(['store_id' => $this->store->id, 'sort_order' => 2]);

        $items = [
            ['media_public_id' => $media1->public_id, 'sort_order' => 2],
            ['media_public_id' => $media2->public_id, 'sort_order' => 1],
        ];

        $this->actingAs($this->merchant)
            ->patchJson("/api/v1/merchant/stores/{$this->store->public_id}/gallery/reorder", ['items' => $items])
            ->assertOk();

        $this->assertEquals(2, $media1->fresh()->sort_order);
        $this->assertEquals(1, $media2->fresh()->sort_order);
    }

    public function test_reorder_rejects_media_from_another_store(): void
    {
        $media1 = StoreMedia::factory()->gallery()->create(['store_id' => $this->store->id]);
        $otherMedia = StoreMedia::factory()->gallery()->create(); // Another store

        $items = [
            ['media_public_id' => $media1->public_id, 'sort_order' => 1],
            ['media_public_id' => $otherMedia->public_id, 'sort_order' => 2],
        ];

        $this->actingAs($this->merchant)
            ->patchJson("/api/v1/merchant/stores/{$this->store->public_id}/gallery/reorder", ['items' => $items])
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'INVALID_MEDIA_ITEMS');
    }
}
