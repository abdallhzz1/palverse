<?php

namespace Tests\Feature\Console;

use App\Models\Store;
use App\Models\StoreAdvertisement;
use App\Models\User;
use App\Support\BusinessDate;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnoseAdvertisementsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_diagnose_reports_expired_ads_and_extend_refreshes_window(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $creator = User::factory()->create();
        $store = Store::factory()->create([
            'status' => 'approved',
            'is_active' => true,
        ]);

        StoreAdvertisement::query()->create([
            'store_id' => $store->id,
            'ad_type' => 'banner',
            'placement' => 'home_hero',
            'is_active' => true,
            'start_date' => BusinessDate::now()->subDays(10)->toDateString(),
            'end_date' => BusinessDate::now()->subDays(2)->toDateString(),
            'amount_paid' => 50,
            'notes' => 'expired banner',
            'image_path' => 'advertisements/test.png',
            'created_by' => $creator->id,
        ]);

        $this->artisan('ads:diagnose')
            ->assertSuccessful();

        $this->artisan('ads:diagnose', ['--extend' => 30])
            ->assertSuccessful();

        $ad = StoreAdvertisement::query()->first();
        $this->assertTrue((bool) $ad->is_active);
        $this->assertSame(BusinessDate::today(), $ad->start_date->toDateString());
        $this->assertSame(BusinessDate::now()->addDays(30)->toDateString(), $ad->end_date->toDateString());
    }
}
