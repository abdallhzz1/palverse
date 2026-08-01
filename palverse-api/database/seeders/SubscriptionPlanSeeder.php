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
        $plans = [
            [
                'code' => 'MONTH_30',
                'name_ar' => 'باقة الشهر',
                'name_en' => 'Monthly Plan',
                'description_ar' => 'إدخال معلومات النشاط، موقع GPS، حتى 50 صورة، وربط حسابات السوشيال ميديا.',
                'description_en' => 'Business info, GPS location, up to 50 photos, and social media links.',
                'price' => 30,
                'currency' => 'ILS',
                'duration_days' => 30,
                'max_offers' => 2,
                'max_gallery_images' => 50,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'YEAR_70',
                'name_ar' => 'باقة السنة',
                'name_en' => 'Yearly Plan',
                'description_ar' => 'إدخال معلومات النشاط، موقع GPS، حتى 150 صورة، وربط حسابات السوشيال ميديا.',
                'description_en' => 'Business info, GPS location, up to 150 photos, and social media links.',
                'price' => 70,
                'currency' => 'ILS',
                'duration_days' => 365,
                'max_offers' => 5,
                'max_gallery_images' => 150,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'YEAR_200',
                'name_ar' => 'باقة السنة المميزة',
                'name_en' => 'Premium Yearly Plan',
                'description_ar' => 'كل المزايا مع صور بعدد مفتوح وربط موقع إلكتروني.',
                'description_en' => 'All features with unlimited photos and website link.',
                'price' => 200,
                'currency' => 'ILS',
                'duration_days' => 365,
                'max_offers' => 20,
                'max_gallery_images' => null, // unlimited
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['code' => $plan['code']],
                $plan
            );
        }

        // Keep legacy plans inactive so existing subscriptions remain readable.
        SubscriptionPlan::query()
            ->whereIn('code', ['FREE', 'BASIC', 'PREMIUM'])
            ->update(['is_active' => false]);
    }
}
