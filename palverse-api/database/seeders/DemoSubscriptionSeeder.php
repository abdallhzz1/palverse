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
        // 1. Create Plans
        $basic = SubscriptionPlan::updateOrCreate(
            ['code' => 'BASIC'],
            [
                'name_ar' => 'الخطة الأساسية',
                'name_en' => 'Basic',
                'description_ar' => 'ظهور في الدليل، معلومات التواصل، ساعات العمل، صورة شعار وصورة غلاف',
                'description_en' => 'Directory listing, contact info, working hours, logo and cover image',
                'price' => 49.00,
                'currency' => 'ILS',
                'duration_days' => 30,
                'max_offers' => 0,
                'max_gallery_images' => 5,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $pro = SubscriptionPlan::updateOrCreate(
            ['code' => 'PROFESSIONAL'],
            [
                'name_ar' => 'الخطة الاحترافية',
                'name_en' => 'Professional',
                'description_ar' => 'جميع مزايا الخطة الأساسية، معرض صور، نشر عروض، أولوية في نتائج البحث',
                'description_en' => 'All basic features, gallery, publish offers, priority search',
                'price' => 99.00,
                'currency' => 'ILS',
                'duration_days' => 30,
                'max_offers' => 5,
                'max_gallery_images' => 10,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $premium = SubscriptionPlan::updateOrCreate(
            ['code' => 'PREMIUM'],
            [
                'name_ar' => 'الخطة المميزة',
                'name_en' => 'Premium',
                'description_ar' => 'جميع مزايا الخطة الاحترافية، ظهور مميز، مساحة ترويجية',
                'description_en' => 'All professional features, featured listing, promotional space',
                'price' => 179.00,
                'currency' => 'ILS',
                'duration_days' => 30,
                'max_offers' => 15,
                'max_gallery_images' => 30,
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

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
            $this->assignSubscription($approvedStores[$currentIndex++], $pro, SubscriptionStatus::ACTIVE, now()->subDays(10), now()->addDays(20), $admin);
        }

        // Expiring Soon
        for ($i = 0; $i < $expiringCount && $currentIndex < $approvedStores->count(); $i++) {
            $this->assignSubscription($approvedStores[$currentIndex++], $basic, SubscriptionStatus::ACTIVE, now()->subDays(25), now()->addDays(5), $admin);
        }

        // Expired
        for ($i = 0; $i < $expiredCount && $currentIndex < $approvedStores->count(); $i++) {
            $this->assignSubscription($approvedStores[$currentIndex++], $basic, SubscriptionStatus::EXPIRED, now()->subDays(40), now()->subDays(10), $admin);
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
