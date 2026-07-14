<?php

namespace Database\Seeders;

use App\Enums\AuditAction;
use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\City;
use App\Models\Offer;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (! config('palverse.demo.seed_enabled')) {
            $this->command->warn('Demo data seeding is disabled. Enable it by setting PALVERSE_SEED_DEMO_DATA=true in your environment.');

            return;
        }

        $this->command->info('Starting Demo Data Seed...');

        $password = Hash::make(config('palverse.demo.password'));

        // 1. Accounts
        $admin = User::updateOrCreate(
            ['email' => 'admin@palverse.test'],
            [
                'name' => 'Palverse Admin',
                'password' => $password,
                'role' => 'admin',
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ]
        );

        $merchant = User::updateOrCreate(
            ['email' => 'merchant1@palverse.test'],
            [
                'name' => 'متجر القدس',
                'password' => $password,
                'role' => 'merchant',
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ]
        );

        $merchant2 = User::updateOrCreate(
            ['email' => 'merchant2@palverse.test'],
            [
                'name' => 'متجر الخليل',
                'password' => $password,
                'role' => 'merchant',
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'suspended@palverse.test'],
            [
                'name' => 'Suspended Merchant',
                'password' => $password,
                'role' => 'merchant',
                'status' => UserStatus::Suspended->value,
                'email_verified_at' => now(),
            ]
        );

        // 2. Taxonomy (Categories)
        $categories = [
            ['name_ar' => 'مطاعم', 'name_en' => 'Restaurants', 'slug' => 'restaurants'],
            ['name_ar' => 'ملابس', 'name_en' => 'Clothing', 'slug' => 'clothing'],
            ['name_ar' => 'إلكترونيات', 'name_en' => 'Electronics', 'slug' => 'electronics'],
            ['name_ar' => 'أثاث', 'name_en' => 'Furniture', 'slug' => 'furniture'],
            ['name_ar' => 'صحة وجمال', 'name_en' => 'Health & Beauty', 'slug' => 'health-beauty'],
            ['name_ar' => 'تعليم', 'name_en' => 'Education', 'slug' => 'education'],
            ['name_ar' => 'حلويات', 'name_en' => 'Sweets', 'slug' => 'sweets'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = Category::updateOrCreate(
                ['slug' => $cat['slug']],
                ['name_ar' => $cat['name_ar'], 'name_en' => $cat['name_en']]
            );
        }

        // Cities & Zones
        $city = City::updateOrCreate(['name_en' => 'Ramallah'], ['name_ar' => 'رام الله']);
        $zone1 = Zone::updateOrCreate(['city_id' => $city->id, 'name_en' => 'Al-Masyoun'], ['name_ar' => 'الماسيون']);
        $zone2 = Zone::updateOrCreate(['city_id' => $city->id, 'name_en' => 'Al-Tireh'], ['name_ar' => 'الطيرة']);

        $city2 = City::updateOrCreate(['name_en' => 'Hebron'], ['name_ar' => 'الخليل']);
        $zone3 = Zone::updateOrCreate(['city_id' => $city2->id, 'name_en' => 'Ein Sarah'], ['name_ar' => 'عين سارة']);

        // 3. Plan
        $plan = SubscriptionPlan::first() ?? SubscriptionPlan::create([
            'name_ar' => 'الخطة الأساسية',
            'name_en' => 'Basic Plan',
            'price' => 100,
            'duration_days' => 365,
            'is_active' => true,
        ]);

        // 4. Stores
        $this->createDemoStore('ramallah-rest-1', $merchant, $categoryModels[0], $city, $zone1, 'مطعم القدس الأول', 'Al Quds Premium Restaurant', StoreStatus::APPROVED, true, true);
        $this->createDemoStore('hebron-cloth-1', $merchant2, $categoryModels[1], $city2, $zone3, 'أزياء الخليل', 'Hebron Fashion', StoreStatus::APPROVED, true, true);
        $this->createDemoStore('ramallah-sweets-pending', $merchant, $categoryModels[6], $city, $zone2, 'حلويات الطيرة', 'Tireh Sweets', StoreStatus::PENDING, false, false);
        $this->createDemoStore('ramallah-tech-rejected', $merchant2, $categoryModels[2], $city, $zone1, 'تقنية الخليل', 'Hebron Tech', StoreStatus::REJECTED, false, false);
        $this->createDemoStore('hebron-health-expired', $merchant2, $categoryModels[4], $city2, $zone3, 'صيدلية الشفاء', 'Al Shifa Pharmacy', StoreStatus::APPROVED, true, false);

        $this->command->info('Demo Data Seeded Successfully.');
    }

    private function createDemoStore($slug, $owner, $category, $city, $zone, $nameAr, $nameEn, StoreStatus $status, $isActive, $hasActiveSub)
    {
        $store = Store::updateOrCreate(
            ['slug' => $slug],
            [
                'owner_id' => $owner->id,
                'category_id' => $category->id,
                'city_id' => $city->id,
                'zone_id' => $zone->id,
                'name_ar' => $nameAr,
                'name_en' => $nameEn,
                'description_ar' => "وصف ديمو لـ {$nameAr}",
                'description_en' => "Demo description for {$nameEn}",
                'address_ar' => 'شارع ديمو',
                'address_en' => 'Demo St',
                'phone' => '+970599000000',
                'status' => $status->value,
                'is_active' => $isActive,
                'rejection_reason' => $status === StoreStatus::REJECTED ? 'Demo rejection reason' : null,
            ]
        );

        // Subscription logic
        $plan = SubscriptionPlan::first();
        if ($hasActiveSub) {
            StoreSubscription::updateOrCreate(
                ['store_id' => $store->id, 'status' => SubscriptionStatus::ACTIVE->value],
                [
                    'subscription_plan_id' => $plan->id,
                    'starts_at' => now()->subDays(10),
                    'ends_at' => now()->addDays(355),
                    'plan_snapshot' => $plan->toArray(),
                    'price_snapshot' => $plan->price,
                    'currency_snapshot' => $plan->currency ?? 'ILS',
                    'plan_name_ar_snapshot' => $plan->name_ar,
                    'plan_name_en_snapshot' => $plan->name_en,
                ]
            );
        } elseif ($status === StoreStatus::APPROVED && $isActive && ! $hasActiveSub) {
            // Expired Sub
            StoreSubscription::updateOrCreate(
                ['store_id' => $store->id, 'status' => SubscriptionStatus::EXPIRED->value],
                [
                    'subscription_plan_id' => $plan->id,
                    'starts_at' => now()->subDays(375),
                    'ends_at' => now()->subDays(10),
                    'plan_snapshot' => $plan->toArray(),
                    'price_snapshot' => $plan->price,
                    'currency_snapshot' => $plan->currency ?? 'ILS',
                    'plan_name_ar_snapshot' => $plan->name_ar,
                    'plan_name_en_snapshot' => $plan->name_en,
                ]
            );
        }

        // Offers if Active
        if ($hasActiveSub) {
            Offer::updateOrCreate(
                ['store_id' => $store->id, 'title_en' => 'Demo Discount'],
                [
                    'title_ar' => 'خصم ديمو',
                    'description_ar' => 'وصف الخصم',
                    'description_en' => 'Discount description',
                    'starts_at' => now()->subDays(2),
                    'ends_at' => now()->addDays(7),
                    'is_active' => true,
                ]
            );
        }

        // Audit Log
        AuditLog::updateOrCreate(
            ['subject_type' => Store::class, 'subject_id' => $store->id, 'action' => AuditAction::CREATE->value],
            [
                'actor_id' => $owner->id,
                'actor_type' => get_class($owner),
                'new_values' => ['name_en' => $nameEn],
            ]
        );
    }
}
