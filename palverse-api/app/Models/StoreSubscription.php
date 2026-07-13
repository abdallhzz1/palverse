<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class StoreSubscription extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'store_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'ends_at',
        'activated_at',
        'cancelled_at',
        'expired_at',
        'assigned_by',
        'cancelled_by',
        'cancellation_reason',
        'notes',
        'price_snapshot',
        'currency_snapshot',
        'plan_name_ar_snapshot',
        'plan_name_en_snapshot',
    ];

    protected $hidden = [
        'id',
        'store_id',
        'subscription_plan_id',
        'assigned_by',
        'cancelled_by',
    ];

    protected $casts = [
        'status' => SubscriptionStatus::class,
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'activated_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'expired_at' => 'datetime',
        'price_snapshot' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            if (empty($subscription->public_id)) {
                $subscription->public_id = (string) Str::ulid();
            }
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id')->withTrashed();
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::ACTIVE->value);
    }

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->active()
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::EXPIRED->value);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::CANCELLED->value);
    }

    public function scopeForStore(Builder $query, Store $store): Builder
    {
        return $query->where('store_id', $store->id);
    }

    public function scopeOrderedLatest(Builder $query): Builder
    {
        return $query->orderBy('starts_at', 'desc')->orderBy('created_at', 'desc');
    }

    public function isCurrentlyValid(): bool
    {
        return $this->status === SubscriptionStatus::ACTIVE
            && $this->starts_at->isPast()
            && $this->ends_at->isFuture();
    }
}
