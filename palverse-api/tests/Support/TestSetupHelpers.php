<?php

namespace Tests\Support;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Enums\UserStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

trait TestSetupHelpers
{
    /**
     * Create an active admin user.
     */
    protected function createAdminUser(): User
    {
        $admin = User::factory()->admin()->create([
            'status' => UserStatus::Active->value,
            'email_verified_at' => now(),
        ]);

        return $admin;
    }

    /**
     * Create an active merchant user.
     */
    protected function createMerchantUser(): User
    {
        $merchant = User::factory()->merchant()->create([
            'status' => UserStatus::Active->value,
            'email_verified_at' => now(),
        ]);

        return $merchant;
    }

    protected function seedRolesAndPermissions()
    {
        if (! Role::where('name', 'admin')->exists()) {
            $this->seed(RolesAndPermissionsSeeder::class);
        }
    }

    /**
     * Create an approved public store with an active subscription.
     */
    protected function createPublicStore(?User $merchant = null): Store
    {
        $merchant = $merchant ?? $this->createMerchantUser();
        $category = Category::factory()->create();
        $city = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city->id]);

        $store = Store::factory()->create([
            'owner_id' => $merchant->id,
            'category_id' => $category->id,
            'city_id' => $city->id,
            'zone_id' => $zone->id,
            'status' => StoreStatus::APPROVED->value,
            'is_active' => true,
            'slug' => Str::slug(fake()->company()).'-'.Str::random(6),
        ]);

        $this->assignActiveSubscription($store);

        return $store;
    }

    /**
     * Assign a basic active subscription to a store.
     *
     * @return StoreSubscription
     */
    protected function assignActiveSubscription(Store $store)
    {
        $plan = SubscriptionPlan::first() ?? SubscriptionPlan::factory()->create();

        return $store->subscriptions()->create([
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::ACTIVE->value,
            'starts_at' => now(),
            'ends_at' => now()->addYear(),
            'plan_snapshot' => $plan->toArray(),
            'price_snapshot' => $plan->price,
            'currency_snapshot' => $plan->currency ?? 'ILS',
            'plan_name_ar_snapshot' => $plan->name_ar,
            'plan_name_en_snapshot' => $plan->name_en,
        ]);
    }
}
