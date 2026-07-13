<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $nameEn = fake()->unique()->words(2, true);

        return [
            'name_ar' => fake()->unique()->words(2, true).' (ar)',
            'name_en' => $nameEn,
            'slug' => Str::slug($nameEn),
        ];
    }
}
