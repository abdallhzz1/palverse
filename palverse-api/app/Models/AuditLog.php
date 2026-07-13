<?php

namespace App\Models;

use App\Enums\AuditAction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;
use RuntimeException;

class AuditLog extends Model
{
    use HasFactory;

    // No updated_at for append-only logs
    public const UPDATED_AT = null;

    protected $fillable = [
        'actor_type',
        'actor_id',
        'actor_public_id',
        'actor_name',
        'actor_email',

        'action',

        'subject_type',
        'subject_id',
        'subject_public_id',
        'subject_label',

        'route',
        'method',
        'ip_address',
        'user_agent',
        'request_id',

        'old_values',
        'new_values',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'action' => AuditAction::class,
            'old_values' => 'array',
            'new_values' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (AuditLog $log): void {
            if (blank($log->public_id)) {
                $log->public_id = (string) Str::ulid();
            }
        });

        static::updating(function (AuditLog $log): void {
            throw new RuntimeException('Audit logs are append-only and cannot be modified.');
        });

        static::deleting(function (AuditLog $log): void {
            throw new RuntimeException('Audit logs are append-only and cannot be deleted.');
        });
    }

    // Relationships

    public function actor(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'actor_type', 'actor_id');
    }

    public function subject(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'subject_type', 'subject_id');
    }

    // Scopes

    public function scopeForActor(Builder $query, string $actorPublicId): Builder
    {
        return $query->where('actor_public_id', $actorPublicId);
    }

    public function scopeForSubject(Builder $query, string $subjectType, string $subjectPublicId): Builder
    {
        return $query->where('subject_type', $subjectType)
            ->where('subject_public_id', $subjectPublicId);
    }

    public function scopeAction(Builder $query, string|AuditAction $action): Builder
    {
        return $query->where('action', $action);
    }

    public function scopeCreatedBetween(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
