<?php

namespace Database\Seeders;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class DemoSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Keep demo assignments on the live product plans.
        $this->call(SubscriptionPlanSeeder::class);

        $month = SubscriptionPlan::query()->where('code', 'MONTH_30')->firstOrFail();
        $year = SubscriptionPlan::query()->where('code', 'YEAR_70')->firstOrFail();
        $premium = SubscriptionPlan::query()->where('code', 'YEAR_200')->firstOrFail();

        // 2. Assign Subscriptions to Stores
        $approvedStores = Store::where('status', StoreStatus::APPROVED->value)->get();
        if ($approvedStores->isEmpty()) {
            return;
        }

        $admin = \App\Models\User::role('admin')->first();

        // Target counts
        $activeCount = 7;
        $expiringCount = 2;
        $expiredCount = 2;
        $cancelledCount = 1;

        $currentIndex = 0;

        // Active
        for ($i = 0; $i < $activeCount && $currentIndex < $approvedStores->count(); $i++) {
            $this->assignSubscription($approvedStores[$currentIndex++], $year, SubscriptionStatus::ACTIVE, now()->subDays(10), now()->addDays(20), $admin);
        }

        // Expiring Soon
        for ($i = 0; $i < $expiringCount && $currentIndex < $approvedStores->count(); $i++) {
            $this->assignSubscription($approvedStores[$currentIndex++], $month, SubscriptionStatus::ACTIVE, now()->subDays(25), now()->addDays(5), $admin);
        }

        // Expired
        for ($i = 0; $i < $expiredCount && $currentIndex < $approvedStores->count(); $i++) {
            $this->assignSubscription($approvedStores[$currentIndex++], $month, SubscriptionStatus::EXPIRED, now()->subDays(40), now()->subDays(10), $admin);
        }

        // Cancelled
        for ($i = 0; $i < $cancelledCount && $currentIndex < $approvedStores->count(); $i++) {
            $sub = $this->assignSubscription($approvedStores[$currentIndex++], $premium, SubscriptionStatus::CANCELLED, now()->subDays(15), now()->addDays(15), $admin);
            $sub->cancelled_at = now()->subDays(5);
            $sub->cancelled_by = $admin->id;
            $sub->save();
        }

        // The rest are left without subscriptions naturally.
    }

    private function assignSubscription(Store $store, SubscriptionPlan $plan, SubscriptionStatus $status, $startsAt, $endsAt, $admin)
    {
        if ($store->subscriptions()->where('status', $status->value)->exists()) {
            return $store->subscriptions()->where('status', $status->value)->first();
        }

        return StoreSubscription::create([
            'store_id' => $store->id,
            'subscription_plan_id' => $plan->id,
            'status' => $status->value,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'assigned_by' => $admin->id,
            'price_snapshot' => $plan->price,
            'currency_snapshot' => $plan->currency,
            'plan_name_ar_snapshot' => $plan->name_ar,
            'plan_name_en_snapshot' => $plan->name_en,
        ]);
    }
}
