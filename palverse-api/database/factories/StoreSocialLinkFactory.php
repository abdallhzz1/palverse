<?php

namespace Database\Factories;

use App\Enums\SocialPlatform;
use App\Models\Store;
use App\Models\StoreSocialLink;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StoreSocialLink>
 */
class StoreSocialLinkFactory extends Factory
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
            'platform' => SocialPlatform::OTHER,
            'url' => $this->faker->url(),
            'username' => $this->faker->userName(),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function facebook(): static
    {
        return $this->state(fn (array $attributes) => [
            'platform' => SocialPlatform::FACEBOOK,
            'url' => 'https://facebook.com/'.$this->faker->userName(),
        ]);
    }

    public function instagram(): static
    {
        return $this->state(fn (array $attributes) => [
            'platform' => SocialPlatform::INSTAGRAM,
            'url' => 'https://instagram.com/'.$this->faker->userName(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
