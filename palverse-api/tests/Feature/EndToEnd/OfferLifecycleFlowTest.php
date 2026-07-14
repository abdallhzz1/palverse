<?php

namespace Tests\Feature\EndToEnd;

use App\Models\Offer;
use App\Models\Store;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OfferLifecycleFlowTest extends EndToEndTestCase
{
    public function test_complete_offer_lifecycle_flow()
    {
        Storage::fake('public');

        // 1. Public store exists with valid subscription.
        $merchant = $this->createMerchantUser();
        $store = $this->createPublicStore($merchant);
        $merchantToken = $merchant->createToken('device')->plainTextToken;

        // 2. Merchant creates offer.
        $offerData = [
            'store_id' => $store->public_id,
            'title_ar' => 'عرض خاص',
            'title_en' => 'Special Offer',
            'description_ar' => 'وصف العرض',
            'description_en' => 'Offer Description',
            'starts_at' => now()->subDay()->toDateTimeString(),
            'ends_at' => now()->addDays(5)->toDateTimeString(),
            'is_active' => true,
        ];

        $createResponse = $this->withToken($merchantToken)->postJson("/api/v1/merchant/stores/{$store->public_id}/offers", $offerData);
        $this->assertApiSuccess($createResponse);
        $offerId = $createResponse->json('data.public_id');

        // 3. Offer image upload succeeds. (Sent via update since no dedicated image endpoint exists)
        $imageResponse = $this->withToken($merchantToken)->call(
            'POST',
            "/api/v1/merchant/stores/{$store->public_id}/offers/{$offerId}",
            ['_method' => 'PUT'],
            [],
            ['image' => UploadedFile::fake()->image('offer.jpg')],
            ['HTTP_ACCEPT' => 'application/json']
        );
        $this->assertApiSuccess($imageResponse);

        // 4. Offer appears in merchant offer list.
        $merchantListResponse = $this->withToken($merchantToken)->getJson("/api/v1/merchant/stores/{$store->public_id}/offers");
        $this->assertApiSuccess($merchantListResponse);
        $merchantListResponse->assertJsonFragment(['public_id' => $offerId]);

        // 5. Offer appears publicly when active and current.
        $publicListResponse = $this->getJson("/api/v1/stores/{$store->slug}/offers");
        $this->assertApiSuccess($publicListResponse);
        $publicListResponse->assertJsonFragment(['public_id' => $offerId]);

        // 7. Search has_offers filter returns store.
        $searchResponse = $this->getJson('/api/v1/stores?has_offers=1');
        $searchResponse->assertJsonFragment(['public_id' => $store->public_id]);

        // 8. Admin deactivates offer.
        $admin = $this->createAdminUser();
        $adminToken = $admin->createToken('admin')->plainTextToken;

        Auth::forgetGuards();

        $deactivateResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/offers/{$offerId}/deactivate");
        $this->assertApiSuccess($deactivateResponse);

        // 9. Offer disappears publicly.
        $publicListResponse2 = $this->getJson("/api/v1/stores/{$store->slug}/offers");
        $publicListResponse2->assertJsonMissing(['public_id' => $offerId]);

        // 10. Merchant may still view it.
        Auth::forgetGuards();
        $merchantListResponse2 = $this->withToken($merchantToken)->getJson("/api/v1/merchant/stores/{$store->public_id}/offers");
        $merchantListResponse2->assertJsonFragment(['public_id' => $offerId]);

        // 11. Admin reactivates offer.
        Auth::forgetGuards();
        $activateResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/offers/{$offerId}/activate");

        // 12. Merchant updates offer.
        Auth::forgetGuards();
        $updateResponse = $this->withToken($merchantToken)->putJson("/api/v1/merchant/stores/{$store->public_id}/offers/{$offerId}", [
            'title_en' => 'Updated Special Offer',
        ]);
        if ($updateResponse->status() >= 300) {
        }
        $this->assertApiSuccess($updateResponse);

        // 13. Merchant deletes offer.
        $deleteResponse = $this->withToken($merchantToken)->deleteJson("/api/v1/merchant/stores/{$store->public_id}/offers/{$offerId}");
        $deleteResponse->assertStatus(204);

        // Verify it's gone
        $merchantListResponse3 = $this->withToken($merchantToken)->getJson("/api/v1/merchant/stores/{$store->public_id}/offers");
        $merchantListResponse3->assertJsonMissing(['public_id' => $offerId]);
    }
}
