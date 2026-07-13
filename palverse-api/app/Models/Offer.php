<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'store_id',
        'title_ar',
        'title_en',
        'description_ar',
        'description_en',
        'price',
        'old_price',
        'currency',
        'image_path',
        'image_disk',
        'starts_at',
        'ends_at',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    protected $attributes = [
        'currency' => 'ILS',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->public_id)) {
                $model->public_id = (string) Str::ulid();
            }
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return Storage::disk($this->image_disk ?? 'public')->url($this->image_path);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrentlyValid(Builder $query): Builder
    {
        return $query->where(function ($query) {
            $query->whereNull('starts_at')
                ->orWhere('starts_at', '<=', now());
        })->where(function ($query) {
            $query->whereNull('ends_at')
                ->orWhere('ends_at', '>=', now());
        });
    }

    public function scopePublicVisible(Builder $query): Builder
    {
        return $query->active()
            ->currentlyValid()
            ->whereHas('store', function ($q) {
                $q->publicVisible();
            });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    public function scopeForStore(Builder $query, int $storeId): Builder
    {
        return $query->where('store_id', $storeId);
    }
}
