<?php

namespace Database\Factories;

use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SystemSettingFactory extends Factory
{
    protected $model = SystemSetting::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::ulid(),
            'group' => 'general',
            'key' => $this->faker->unique()->slug(2),
            'value' => $this->faker->word(),
            'type' => 'string',
            'is_public' => true,
            'description_ar' => $this->faker->sentence(),
            'description_en' => $this->faker->sentence(),
        ];
    }
}
