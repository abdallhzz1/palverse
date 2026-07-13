<?php

namespace App\Models;

use App\Enums\StoreStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Store extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name_ar',
        'name_en',
        'description_ar',
        'description_en',
        'phone',
        'whatsapp',
        'website',
        'email',
        'address_ar',
        'address_en',
        'latitude',
        'longitude',
        'category_id',
        'city_id',
        'zone_id',
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'status' => StoreStatus::class,
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($store) {
            if (empty($store->public_id)) {
                $store->public_id = (string) Str::ulid();
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', StoreStatus::PENDING->value);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', StoreStatus::APPROVED->value);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopePublicVisible(Builder $query): Builder
    {
        // TODO: Valid subscription will become part of publicVisible later in Phase 2
        return $query->approved()->active();
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function media(): HasMany
    {
        return $this->hasMany(StoreMedia::class);
    }

    public function logo(): HasOne
    {
        return $this->hasOne(StoreMedia::class)->logo();
    }

    public function cover(): HasOne
    {
        return $this->hasOne(StoreMedia::class)->cover();
    }

    public function gallery(): HasMany
    {
        return $this->hasMany(StoreMedia::class)->gallery()->ordered();
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('owner_id', $user->id);
    }
}
