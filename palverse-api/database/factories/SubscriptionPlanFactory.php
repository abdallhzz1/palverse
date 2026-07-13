<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->word().'_'.$this->faker->numberBetween(100, 999),
            'name_ar' => $this->faker->word().' بالعربي',
            'name_en' => $this->faker->word().' in English',
            'description_ar' => $this->faker->sentence(),
            'description_en' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 0, 1000),
            'currency' => 'ILS',
            'duration_days' => $this->faker->numberBetween(30, 365),
            'max_offers' => $this->faker->numberBetween(10, 100),
            'max_gallery_images' => $this->faker->numberBetween(10, 50),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}
