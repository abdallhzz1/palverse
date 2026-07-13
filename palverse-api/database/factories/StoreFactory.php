<?php

namespace Database\Factories;

use App\Enums\StoreStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    protected $model = Store::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'category_id' => Category::factory(),
            'city_id' => City::factory(),
            'zone_id' => Zone::factory(),
            'name_ar' => $this->faker->company(),
            'name_en' => $this->faker->company(),
            'description_ar' => $this->faker->paragraph(),
            'description_en' => $this->faker->paragraph(),
            'phone' => $this->faker->phoneNumber(),
            'address_ar' => $this->faker->address(),
            'status' => StoreStatus::PENDING,
            'is_active' => false,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::PENDING,
            'is_active' => false,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::APPROVED,
            'is_active' => true,
            'approved_at' => now(),
            'approved_by' => User::factory(), // Should ideally be an admin
            'slug' => $this->faker->unique()->slug(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::REJECTED,
            'is_active' => false,
            'rejected_at' => now(),
            'rejected_by' => User::factory(),
            'rejection_reason' => $this->faker->sentence(),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
