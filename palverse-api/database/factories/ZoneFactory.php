<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Zone>
 */
class ZoneFactory extends Factory
{
    public function definition(): array
    {
        return [
            'city_id' => City::factory(),
            'name_ar' => fake()->unique()->words(2, true).' (ar)',
            'name_en' => fake()->unique()->words(2, true),
        ];
    }

    /**
     * Associate zone with a specific city.
     */
    public function forCity(City $city): static
    {
        return $this->state(fn (array $attributes): array => [
            'city_id' => $city->id,
        ]);
    }
}
