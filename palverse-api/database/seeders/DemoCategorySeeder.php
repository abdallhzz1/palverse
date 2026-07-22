<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name_ar' => 'مطاعم', 'name_en' => 'Restaurants'],
            ['name_ar' => 'مقاهي وحلويات', 'name_en' => 'Cafes & Sweets'],
            ['name_ar' => 'ملابس وأزياء', 'name_en' => 'Fashion & Clothing'],
            ['name_ar' => 'إلكترونيات وهواتف', 'name_en' => 'Electronics & Mobile'],
            ['name_ar' => 'أثاث ومفروشات', 'name_en' => 'Furniture & Home'],
            ['name_ar' => 'خدمات منزلية', 'name_en' => 'Home Services'],
            ['name_ar' => 'صحة وجمال', 'name_en' => 'Health & Beauty'],
            ['name_ar' => 'تعليم وتدريب', 'name_en' => 'Education & Training'],
            ['name_ar' => 'سيارات وقطع غيار', 'name_en' => 'Automotive'],
            ['name_ar' => 'مواد غذائية', 'name_en' => 'Groceries'],
            ['name_ar' => 'هدايا وورود', 'name_en' => 'Gifts & Flowers'],
            ['name_ar' => 'حرف وصناعات محلية', 'name_en' => 'Local Crafts'],
        ];

        foreach ($categories as $index => $categoryData) {
            Category::updateOrCreate(
                ['name_en' => $categoryData['name_en']],
                [
                    'name_ar' => $categoryData['name_ar'],
                    'slug' => Str::slug($categoryData['name_en']),
                ]
            );
        }
    }
}
