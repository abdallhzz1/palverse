<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class StoreWorkingHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'day_of_week',
        'period_index',
        'opens_at',
        'closes_at',
        'is_closed',
    ];

    protected $hidden = [
        'id',
        'store_id',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'period_index' => 'integer',
        'is_closed' => 'boolean',
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

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('day_of_week')->orderBy('period_index');
    }

    public function scopeForDay(Builder $query, int $dayOfWeek): Builder
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeOpenPeriods(Builder $query): Builder
    {
        return $query->where('is_closed', false);
    }
}
