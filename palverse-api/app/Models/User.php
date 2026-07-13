<?php

namespace App\Models;

use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
    ];

    protected $hidden = [
        'id',
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
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
}
