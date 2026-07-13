<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SubscriptionPlan::firstOrCreate([
            'code' => 'FREE',
        ], [
            'name_ar' => 'باقة مجانية',
            'name_en' => 'Free Plan',
            'description_ar' => 'باقة مجانية لتجربة المنصة.',
            'description_en' => 'Free plan to try the platform.',
            'price' => 0,
            'currency' => 'ILS',
            'duration_days' => 30,
            'max_offers' => 0,
            'max_gallery_images' => 5,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        SubscriptionPlan::firstOrCreate([
            'code' => 'BASIC',
        ], [
            'name_ar' => 'باقة أساسية',
            'name_en' => 'Basic Plan',
            'description_ar' => 'باقة للمتاجر الصغيرة.',
            'description_en' => 'Plan for small stores.',
            'price' => 100,
            'currency' => 'ILS',
            'duration_days' => 365,
            'max_offers' => 2,
            'max_gallery_images' => 10,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        SubscriptionPlan::firstOrCreate([
            'code' => 'PREMIUM',
        ], [
            'name_ar' => 'باقة مميزة',
            'name_en' => 'Premium Plan',
            'description_ar' => 'باقة للمتاجر الكبيرة بجميع المزايا.',
            'description_en' => 'Plan for large stores with all features.',
            'price' => 250,
            'currency' => 'ILS',
            'duration_days' => 365,
            'max_offers' => 10,
            'max_gallery_images' => 50,
            'is_active' => true,
            'sort_order' => 3,
        ]);
    }
}
