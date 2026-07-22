<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\StoreReview;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreReviewFactory extends Factory
{
    protected $model = StoreReview::class;

    public function definition(): array
    {
        return [
            'store_id' => Store::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'reviewer_name' => $this->faker->name(),
            'comment' => $this->faker->sentence(),
            'visitor_token_hash' => hash('sha256', $this->faker->unique()->word()),
            'status' => \App\Enums\StoreReviewStatus::PENDING->value,
        ];
    }
}
