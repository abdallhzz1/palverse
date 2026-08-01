<?php

namespace App\Models;

use App\Models\Traits\HasPublicReferenceCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class SubscriptionPlan extends Model
{
    use HasFactory;
    use HasPublicReferenceCache;
    use SoftDeletes;

    public function getCacheDomain(): string
    {
        return 'plans';
    }

    protected $fillable = [
        'name_ar',
        'name_en',
        'code',
        'description_ar',
        'description_en',
        'price',
        'currency',
        'duration_days',
        'max_offers',
        'max_gallery_images',
        'is_active',
        'sort_order',
    ];

    protected $hidden = [
        'id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_days' => 'integer',
        'max_offers' => 'integer',
        'max_gallery_images' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($plan) {
            if (empty($plan->public_id)) {
                $plan->public_id = (string) Str::ulid();
            }
        });
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(StoreSubscription::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Website link is included only on the YEAR_200 premium yearly plan.
     */
    public function allowsWebsite(): bool
    {
        return $this->code === 'YEAR_200';
    }

    /**
     * null max_gallery_images means unlimited gallery uploads.
     */
    public function hasUnlimitedGallery(): bool
    {
        return $this->max_gallery_images === null;
    }
}
