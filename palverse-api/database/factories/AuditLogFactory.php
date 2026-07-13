<?php

namespace Database\Factories;

use App\Enums\AuditAction;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::ulid(),
            'action' => $this->faker->randomElement(AuditAction::cases())->value,
            'actor_type' => 'user',
            'actor_id' => User::factory(),
            'actor_public_id' => $this->faker->uuid,
            'actor_name' => $this->faker->name,
            'actor_email' => $this->faker->unique()->safeEmail,

            'subject_type' => User::class,
            'subject_id' => $this->faker->randomNumber(5),
            'subject_public_id' => $this->faker->uuid,
            'subject_label' => $this->faker->name,

            'route' => '/api/v1/admin/users',
            'method' => 'POST',
            'ip_address' => $this->faker->ipv4,
            'user_agent' => $this->faker->userAgent,
            'request_id' => (string) Str::uuid(),

            'old_values' => null,
            'new_values' => ['status' => 'active'],
            'metadata' => ['reason' => 'test'],
        ];
    }
}
