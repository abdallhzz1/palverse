<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Store;
use Illuminate\Database\Seeder;

class DemoOfferSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get stores that have active subscriptions capable of offers
        // In demo, we'll just attach to approved stores.
        $stores = Store::where('status', 'approved')->where('is_active', true)->get();

        if ($stores->isEmpty()) {
            return;
        }

        $offersData = [
            ['ar' => 'خصم 20% على وجبات العائلة', 'en' => '20% Off Family Meals', 'price' => 80.00, 'old' => 100.00],
            ['ar' => 'قهوة وحلوى بسعر خاص', 'en' => 'Coffee & Sweets Special', 'price' => 15.00, 'old' => 25.00],
            ['ar' => 'اشترِ قطعتين واحصل على الثالثة بنصف السعر', 'en' => 'Buy 2 Get 1 Half Price', 'price' => null, 'old' => null],
            ['ar' => 'خصم على شاشات الهواتف', 'en' => 'Discount on Phone Screens', 'price' => 50.00, 'old' => 100.00],
            ['ar' => 'خصم 15% على غرف النوم', 'en' => '15% Off Bedrooms', 'price' => 3000.00, 'old' => 3500.00],
            ['ar' => 'جلسة عناية بسعر مخفض', 'en' => 'Beauty Care Session at Reduced Price', 'price' => 120.00, 'old' => 150.00],
            ['ar' => 'تسجيل مبكر بدورة التصميم', 'en' => 'Early Registration Design Course', 'price' => 500.00, 'old' => 700.00],
            ['ar' => 'باقة صيانة منزلية', 'en' => 'Home Maintenance Package', 'price' => 100.00, 'old' => 150.00],
            ['ar' => 'عرض خاص على باقات الورد', 'en' => 'Special on Flower Bouquets', 'price' => 45.00, 'old' => 60.00],
            ['ar' => 'خصم على منتجات زيت الزيتون', 'en' => 'Discount on Olive Oil Products', 'price' => 35.00, 'old' => 45.00],
            // Inactive / expired
            ['ar' => 'عرض منتهي (الصيف)', 'en' => 'Expired Offer (Summer)', 'price' => 10.00, 'old' => 20.00, 'expired' => true],
            ['ar' => 'عرض غير مفعل', 'en' => 'Inactive Offer', 'price' => null, 'old' => null, 'inactive' => true],
            // Future
            ['ar' => 'عرض قادم (الشتاء)', 'en' => 'Upcoming Offer (Winter)', 'price' => 90.00, 'old' => 120.00, 'future' => true],
            ['ar' => 'خصم نهاية العام', 'en' => 'End of Year Discount', 'price' => 50.00, 'old' => 100.00, 'future' => true],
        ];

        $storeIndex = 0;

        foreach ($offersData as $data) {
            $store = $stores[$storeIndex % $stores->count()];
            $storeIndex++;

            $startsAt = now()->subDays(2);
            $endsAt = now()->addDays(7);
            $isActive = true;

            if (isset($data['expired']) && $data['expired']) {
                $startsAt = now()->subDays(10);
                $endsAt = now()->subDays(2);
            } elseif (isset($data['future']) && $data['future']) {
                $startsAt = now()->addDays(10);
                $endsAt = now()->addDays(20);
            } elseif (isset($data['inactive']) && $data['inactive']) {
                $isActive = false;
            }

            Offer::updateOrCreate(
                [
                    'store_id' => $store->id,
                    'title_en' => $data['en'],
                ],
                [
                    'title_ar' => $data['ar'],
                    'description_ar' => "تفاصيل العرض: {$data['ar']}",
                    'description_en' => "Offer details: {$data['en']}",
                    'price' => $data['price'],
                    'old_price' => $data['old'],
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'is_active' => $isActive,
                ]
            );
        }
    }
}
