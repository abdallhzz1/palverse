<?php

namespace Database\Factories;

use App\Models\Offer;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
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
            'title_ar' => $this->faker->words(3, true),
            'title_en' => $this->faker->words(3, true),
            'description_ar' => $this->faker->sentence(),
            'description_en' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'old_price' => $this->faker->randomFloat(2, 100, 200),
            'currency' => 'ILS',
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->subDays(1),
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->addDays(1),
            'ends_at' => now()->addDays(10),
        ]);
    }

    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subDays(1),
            'ends_at' => now()->addDays(5),
        ]);
    }

    public function withImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'image_path' => 'offers/test-image.jpg',
            'image_disk' => 'public',
        ]);
    }
}
