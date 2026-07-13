<?php

namespace Database\Factories;

use App\Enums\StoreMediaType;
use App\Models\Store;
use App\Models\StoreMedia;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StoreMediaFactory extends Factory
{
    protected $model = StoreMedia::class;

    public function definition(): array
    {
        return [
            'store_id' => Store::factory(),
            'type' => StoreMediaType::GALLERY->value,
            'file_path' => 'stores/dummy/'.Str::random(10).'.jpg',
            'disk' => 'public',
            'original_name' => $this->faker->word().'.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => $this->faker->numberBetween(1024, 1024000),
            'width' => 800,
            'height' => 600,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }

    public function logo(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => StoreMediaType::LOGO->value,
            'sort_order' => 0,
        ]);
    }

    public function cover(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => StoreMediaType::COVER->value,
            'sort_order' => 0,
            'width' => 1200,
            'height' => 400,
        ]);
    }

    public function gallery(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => StoreMediaType::GALLERY->value,
        ]);
    }
}
