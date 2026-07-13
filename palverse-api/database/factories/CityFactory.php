<?php

namespace Database\Factories;

use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name_ar' => fake()->unique()->city().' (ar)',
            'name_en' => fake()->unique()->city(),
        ];
    }
}
