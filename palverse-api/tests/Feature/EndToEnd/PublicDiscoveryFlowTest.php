<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\StoreStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Offer;
use App\Models\Store;
use App\Models\Zone;

class PublicDiscoveryFlowTest extends EndToEndTestCase
{
    public function test_public_discovery_flow()
    {
        // Setup deterministic data
        $cat1 = Category::factory()->create(['name_ar' => 'مطاعم', 'name_en' => 'Restaurants']);
        $cat2 = Category::factory()->create(['name_ar' => 'ملابس', 'name_en' => 'Clothing']);

        $city1 = City::factory()->create(['name_ar' => 'رام الله', 'name_en' => 'Ramallah']);
        $city2 = City::factory()->create(['name_ar' => 'الخليل', 'name_en' => 'Hebron']);

        $zone1 = Zone::factory()->create(['city_id' => $city1->id, 'name_ar' => 'الماسيون', 'name_en' => 'Al-Masyoun']);
        $zone2 = Zone::factory()->create(['city_id' => $city2->id, 'name_ar' => 'عين سارة', 'name_en' => 'Ein Sarah']);

        // Store 1: Visible, Ramallah, Restaurant, Has Active Offer
        $store1 = Store::factory()->create([
            'category_id' => $cat1->id,
            'city_id' => $city1->id,
            'zone_id' => $zone1->id,
            'name_ar' => 'مطعم القدس',
            'name_en' => 'Al Quds Restaurant',
            'status' => StoreStatus::APPROVED->value,
            'is_active' => true,
        ]);
        $this->assignActiveSubscription($store1);
        Offer::factory()->create(['store_id' => $store1->id, 'is_active' => true, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(5)]);

        // Store 2: Visible, Hebron, Clothing, No offers
        $store2 = Store::factory()->create([
            'category_id' => $cat2->id,
            'city_id' => $city2->id,
            'zone_id' => $zone2->id,
            'name_ar' => 'ملابس الخليل',
            'name_en' => 'Hebron Clothing',
            'status' => StoreStatus::APPROVED->value,
            'is_active' => true,
        ]);
        $this->assignActiveSubscription($store2);

        // Store 3: Hidden (Pending)
        $store3 = Store::factory()->create([
            'category_id' => $cat1->id,
            'city_id' => $city1->id,
            'zone_id' => $zone1->id,
            'name_ar' => 'مطعم سري',
            'name_en' => 'Secret Restaurant',
            'status' => StoreStatus::PENDING->value,
        ]);

        // 1. Unfiltered list
        $resAll = $this->getJson('/api/v1/stores');
        $this->assertApiSuccess($resAll);
        $resAll->assertJsonFragment(['public_id' => $store1->public_id]);
        $resAll->assertJsonFragment(['public_id' => $store2->public_id]);
        $resAll->assertJsonMissing(['public_id' => $store3->public_id]); // Hidden store never leaks

        // 2. Arabic search
        $resAr = $this->getJson('/api/v1/stores?query=مطعم');
        $this->assertApiSuccess($resAr);
        $resAr->assertJsonFragment(['public_id' => $store1->public_id]);
        $resAr->assertJsonMissing(['public_id' => $store2->public_id]);

        // 3. Category filter
        $resCat = $this->getJson("/api/v1/stores?category={$cat2->slug}");
        $this->assertApiSuccess($resCat);
        $resCat->assertJsonFragment(['public_id' => $store2->public_id]);
        $resCat->assertJsonMissing(['public_id' => $store1->public_id]);

        // 4. City filter
        $resCity = $this->getJson("/api/v1/stores?city={$city1->public_id}");
        $this->assertApiSuccess($resCity);
        $resCity->assertJsonFragment(['public_id' => $store1->public_id]);
        $resCity->assertJsonMissing(['public_id' => $store2->public_id]);

        // 5. Zone filter
        $resZone = $this->getJson("/api/v1/stores?zone={$zone2->public_id}");
        $this->assertApiSuccess($resZone);
        $resZone->assertJsonFragment(['public_id' => $store2->public_id]);
        $resZone->assertJsonMissing(['public_id' => $store1->public_id]);

        // 6. Offer filters (has_offers)
        $resOffers = $this->getJson('/api/v1/stores?has_offers=1');
        $this->assertApiSuccess($resOffers);
        $resOffers->assertJsonFragment(['public_id' => $store1->public_id]);
        $resOffers->assertJsonMissing(['public_id' => $store2->public_id]);
    }
}
