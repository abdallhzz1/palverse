<?php

namespace App\Models;

use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'preferred_locale',
        'status',
        'suspension_reason',
    ];

    protected $hidden = [
        'id',
        'password',
        'remember_token',
        'suspended_by',
        'deactivated_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'suspended_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (blank($user->public_id)) {
                $user->public_id = (string) Str::ulid();
            }
        });
    }

    // Relationships

    public function suspendedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'suspended_by');
    }

    public function deactivatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deactivated_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function storesOwned(): HasMany
    {
        return $this->hasMany(Store::class, 'owner_id');
    }

    public function subscriptionsAssigned(): HasMany
    {
        return $this->hasMany(StoreSubscription::class, 'assigned_by');
    }

    public function subscriptionsCancelled(): HasMany
    {
        return $this->hasMany(StoreSubscription::class, 'cancelled_by');
    }

    public function storesApproved(): HasMany
    {
        return $this->hasMany(Store::class, 'approved_by');
    }

    public function storesRejected(): HasMany
    {
        return $this->hasMany(Store::class, 'rejected_by');
    }

    // Scopes

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Active);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Inactive);
    }

    public function scopeSuspended(Builder $query): Builder
    {
        return $query->where('status', UserStatus::Suspended);
    }

    public function scopeMerchants(Builder $query): Builder
    {
        return $query->role('merchant');
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $query->role('admin');
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        $term = "%{$term}%";

        return $query->where(function (Builder $q) use ($term): void {
            $q->where('name', 'LIKE', $term)
                ->orWhere('email', 'LIKE', $term)
                ->orWhere('phone', 'LIKE', $term);
        });
    }

    // Helpers

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isMerchant(): bool
    {
        return $this->hasRole('merchant');
    }

    public function canBeDisabledBy(User $actor): bool
    {
        // Protect the last admin and self-disable
        if ($this->isAdmin()) {
            if ($this->id === $actor->id) {
                return false;
            }

            // Check if there are other active admins
            $activeAdminsCount = User::active()->admins()->count();
            if ($activeAdminsCount <= 1) {
                return false;
            }
        }

        return true;
    }
}
