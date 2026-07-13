<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\StoreWorkingHour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StoreWorkingHour>
 */
class StoreWorkingHourFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::ulid(),
            'store_id' => Store::factory(),
            'day_of_week' => $this->faker->numberBetween(0, 6),
            'period_index' => 1,
            'opens_at' => '08:00',
            'closes_at' => '17:00',
            'is_closed' => false,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_closed' => false,
            'opens_at' => '09:00',
            'closes_at' => '22:00',
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_closed' => true,
            'opens_at' => null,
            'closes_at' => null,
        ]);
    }
}
