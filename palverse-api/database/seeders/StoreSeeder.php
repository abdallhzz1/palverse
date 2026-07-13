<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        if (Store::count() > 0) {
            $this->command->info('Stores already seeded. Skipping.');

            return;
        }

        $merchants = User::role('merchant')->get();
        if ($merchants->isEmpty()) {
            $merchants = User::factory()->count(5)->create()->each(function ($user) {
                $user->assignRole('merchant');
            });
        }

        $categories = Category::all();
        if ($categories->isEmpty()) {
            $categories = Category::factory()->count(3)->create();
        }

        $cities = City::with('zones')->get();
        if ($cities->isEmpty()) {
            $city = City::factory()->create();
            Zone::factory()->count(2)->create(['city_id' => $city->id]);
            $cities = City::with('zones')->get();
        }

        foreach ($merchants as $merchant) {
            $city = $cities->random();
            $zone = $city->zones->random();

            Store::factory()->approved()->create([
                'owner_id' => $merchant->id,
                'category_id' => $categories->random()->id,
                'city_id' => $city->id,
                'zone_id' => $zone->id,
            ]);

            Store::factory()->pending()->create([
                'owner_id' => $merchant->id,
                'category_id' => $categories->random()->id,
                'city_id' => $city->id,
                'zone_id' => $zone->id,
            ]);
        }
    }
}
