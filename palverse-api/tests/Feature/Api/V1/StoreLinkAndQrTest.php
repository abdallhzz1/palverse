<?php

namespace Tests\Feature\Api\V1;

use App\Models\Store;
use App\Models\User;
use App\Services\StoreLinkService;
use App\Services\StoreQrCodeService;
use Database\Seeders\RolesAndPermissionsSeeder;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class StoreLinkAndQrTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    /**
     * Test App\Services\StoreLinkService link generation logic.
     */
    public function test_link_service_generates_correct_urls(): void
    {
        $linkService = app(StoreLinkService::class);
        $store = Store::factory()->create(['slug' => 'yasmin-store']);

        // Trailing slash normalization check
        Config::set('palverse.public_web_url', 'https://palverse.ps/');
        $this->assertEquals('https://palverse.ps/stores/yasmin-store', $linkService->generateWebUrl($store));

        // Base checks
        Config::set('palverse.public_web_url', 'https://palverse.ps');
        $this->assertEquals('https://palverse.ps/stores/yasmin-store', $linkService->generateWebUrl($store));
        $this->assertEquals('palverse://stores/yasmin-store', $linkService->generateDeepLink($store));

        // Ensure no numeric database ID is exposed in the generated URLs
        $this->assertStringNotContainsString((string) $store->id, $linkService->generateWebUrl($store));
        $this->assertStringNotContainsString((string) $store->id, $linkService->generateDeepLink($store));
    }

    /**
     * Test link service throws a DomainException when the slug is missing.
     */
    public function test_link_service_throws_exception_for_missing_slug(): void
    {
        $linkService = app(StoreLinkService::class);
        $store = Store::factory()->create(['slug' => null]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('STORE_SLUG_NOT_AVAILABLE');

        $linkService->generateWebUrl($store);
    }

    /**
     * Test guest can retrieve links and QR URLs for a public visible store.
     */
    public function test_guest_can_retrieve_links_for_public_store(): void
    {
        $store = Store::factory()->approved()->active()->withSubscription()->create([
            'slug' => 'public-yasmin',
        ]);

        $response = $this->getJson("/api/v1/stores/{$store->slug}/links");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'store_public_id',
                    'slug',
                    'web_url',
                    'deep_link',
                    'qr_svg_url',
                    'qr_download_url',
                    'is_publicly_visible',
                    'generated_at',
                ],
            ])
            ->assertJsonPath('data.store_public_id', $store->public_id)
            ->assertJsonPath('data.slug', 'public-yasmin')
            ->assertJsonPath('data.is_publicly_visible', true);

        // Ensure numeric ID is not exposed
        $this->assertArrayNotHasKey('id', $response->json('data'));
    }

    /**
     * Test guest gets 404 for unapproved, inactive, or subscription-expired stores.
     */
    public function test_guest_receives_404_for_hidden_stores(): void
    {
        // 1. Pending store
        $pendingStore = Store::factory()->pending()->create(['slug' => 'pending-yasmin']);
        $this->getJson("/api/v1/stores/{$pendingStore->slug}/links")->assertStatus(404);
        $this->getJson("/api/v1/stores/{$pendingStore->slug}/qr")->assertStatus(404);

        // 2. Inactive store
        $inactiveStore = Store::factory()->approved()->inactive()->withSubscription()->create(['slug' => 'inactive-yasmin']);
        $this->getJson("/api/v1/stores/{$inactiveStore->slug}/links")->assertStatus(404);
        $this->getJson("/api/v1/stores/{$inactiveStore->slug}/qr")->assertStatus(404);

        // 3. No active subscription
        $noSubStore = Store::factory()->approved()->active()->create(['slug' => 'nosub-yasmin']); // without subscription
        $this->getJson("/api/v1/stores/{$noSubStore->slug}/links")->assertStatus(404);
        $this->getJson("/api/v1/stores/{$noSubStore->slug}/qr")->assertStatus(404);

        // 4. Soft-deleted store
        $deletedStore = Store::factory()->approved()->active()->withSubscription()->create(['slug' => 'deleted-yasmin']);
        $deletedStore->delete();
        $this->getJson('/api/v1/stores/deleted-yasmin/links')->assertStatus(404);
        $this->getJson('/api/v1/stores/deleted-yasmin/qr')->assertStatus(404);
    }

    /**
     * Test guest can retrieve SVG QR code for public store.
     */
    public function test_guest_can_retrieve_svg_qr_for_public_store(): void
    {
        $store = Store::factory()->approved()->active()->withSubscription()->create([
            'slug' => 'public-qr-store',
        ]);

        $response = $this->get("/api/v1/stores/{$store->slug}/qr");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'image/svg+xml; charset=UTF-8')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Content-Disposition', 'inline; filename="palverse-public-qr-store-qr.svg"');

        // Assert SVG format content
        $this->assertStringContainsString('<svg', $response->getContent());
        $this->assertStringContainsString('</svg>', $response->getContent());
    }

    /**
     * Test QR request parameter validation.
     */
    public function test_qr_validation_rules_and_error_formatting(): void
    {
        $store = Store::factory()->approved()->active()->withSubscription()->create([
            'slug' => 'valid-qr-store',
        ]);

        // Invalid Size
        $response = $this->getJson("/api/v1/stores/{$store->slug}/qr?size=50");
        $response->assertStatus(422)
            ->assertJsonStructure(['success', 'message', 'errors' => ['size']]);

        // Too Large Size
        $response = $this->getJson("/api/v1/stores/{$store->slug}/qr?size=2000");
        $response->assertStatus(422);

        // Unsupported Format
        $response = $this->getJson("/api/v1/stores/{$store->slug}/qr?format=gif");
        $response->assertStatus(422)
            ->assertJsonStructure(['success', 'message', 'errors' => ['format']]);
    }

    /**
     * Test SVG QR code download parameter.
     */
    public function test_qr_download_parameter_sets_attachment_disposition(): void
    {
        $store = Store::factory()->approved()->active()->withSubscription()->create([
            'slug' => 'download-store',
        ]);

        $response = $this->get("/api/v1/stores/{$store->slug}/qr?download=1");

        $response->assertStatus(200)
            ->assertHeader('Content-Disposition', 'attachment; filename="palverse-download-store-qr.svg"');
    }

    /**
     * Test guest cannot access merchant links/qr, but owner can.
     */
    public function test_merchant_authorization_and_ownership(): void
    {
        $merchant = User::factory()->create();
        $merchant->assignRole('merchant');

        $otherMerchant = User::factory()->create();
        $otherMerchant->assignRole('merchant');

        $store = Store::factory()->create([
            'owner_id' => $merchant->id,
            'slug' => 'merchant-store-slug',
            'status' => 'approved',
            'is_active' => false, // Hidden but approved
        ]);

        // Guest cannot access merchant links
        $this->getJson("/api/v1/merchant/stores/{$store->public_id}/links")->assertStatus(401);

        // Unrelated merchant cannot view owned links
        $this->actingAs($otherMerchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/links")
            ->assertStatus(403);

        // Owner can access links (even if store is hidden, as long as it has a slug)
        $response = $this->actingAs($merchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/links");

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'merchant-store-slug')
            ->assertJsonPath('data.is_publicly_visible', false);
    }

    /**
     * Test merchant receives 409 conflict when slug is missing.
     */
    public function test_merchant_receives_409_when_slug_missing(): void
    {
        $merchant = User::factory()->create();
        $merchant->assignRole('merchant');

        $store = Store::factory()->pending()->create([
            'owner_id' => $merchant->id,
            'slug' => null,
        ]);

        $this->actingAs($merchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/links")
            ->assertStatus(409)
            ->assertJsonPath('error.code', 'STORE_SLUG_NOT_AVAILABLE');

        $this->actingAs($merchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/qr")
            ->assertStatus(409)
            ->assertJsonPath('error.code', 'STORE_SLUG_NOT_AVAILABLE');
    }

    /**
     * Test admin can access any store links and QR.
     */
    public function test_admin_can_access_any_store_qr_and_links(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $store = Store::factory()->create([
            'slug' => 'admin-view-store',
        ]);

        $this->actingAs($admin)
            ->getJson("/api/v1/admin/stores/{$store->public_id}/links")
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'admin-view-store');

        $this->actingAs($admin)
            ->get("/api/v1/admin/stores/{$store->public_id}/qr")
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'image/svg+xml; charset=UTF-8');
    }

    /**
     * Test slug lifecycle stability.
     */
    public function test_slug_lifecycle_stability(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $store = Store::factory()->pending()->create(['slug' => null]);
        $this->assertNull($store->slug);

        // 1. Approval flow generates a slug
        $response = $this->actingAs($admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/approve");

        $response->assertStatus(200);
        $store->refresh();
        $this->assertNotNull($store->slug);
        $firstSlug = $store->slug;

        // 2. Generating QR does not change the slug
        $qrService = app(StoreQrCodeService::class);
        $qrService->generate($store);
        $store->refresh();
        $this->assertEquals($firstSlug, $store->slug);

        // 3. Deactivation preserves the slug
        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/deactivate")
            ->assertStatus(200);

        $store->refresh();
        $this->assertEquals($firstSlug, $store->slug);

        // 4. Reactivation preserves the slug
        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/activate")
            ->assertStatus(200);

        $store->refresh();
        $this->assertEquals($firstSlug, $store->slug);
    }
}
