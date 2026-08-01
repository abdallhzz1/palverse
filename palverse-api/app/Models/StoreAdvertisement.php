<?php

namespace App\Models;

use App\Enums\AdPlacement;
use App\Models\Concerns\HasPublicId;
use App\Support\BusinessDate;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreAdvertisement extends Model
{
    use HasFactory, SoftDeletes, HasPublicId;

    protected $fillable = [
        'store_id',
        'ad_type',
        'placement',
        'image_path',
        'start_date',
        'end_date',
        'amount_paid',
        'is_active',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'placement' => AdPlacement::class,
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'amount_paid' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeCurrentlyScheduled(Builder $query, ?string $today = null): Builder
    {
        $today ??= BusinessDate::today();

        return $query
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today);
    }

    public function scopeForPlacement(Builder $query, AdPlacement|string $placement): Builder
    {
        $value = $placement instanceof AdPlacement ? $placement->value : $placement;

        return $query->where('placement', $value);
    }

    /**
     * @return array{
     *   shows_on_homepage: bool,
     *   shows_publicly: bool,
     *   status: string,
     *   reasons: list<string>,
     *   placements: list<string>,
     *   placement: string|null,
     *   placement_meta: array<string, mixed>|null,
     *   business_today: string
     * }
     */
    public function homepageVisibility(): array
    {
        $today = BusinessDate::today();
        $start = optional($this->start_date)->toDateString();
        $end = optional($this->end_date)->toDateString();
        $reasons = [];

        if (! $this->is_active) {
            $reasons[] = 'inactive';
        }

        if ($start && $start > $today) {
            $reasons[] = 'scheduled';
        }

        if ($end && $end < $today) {
            $reasons[] = 'expired';
        }

        $storeVisible = $this->store_id
            ? Store::query()->whereKey($this->store_id)->publicVisible()->exists()
            : false;

        if (! $storeVisible) {
            $reasons[] = 'store_not_public';
        }

        if ($this->ad_type === 'banner' && blank($this->image_path)) {
            $reasons[] = 'missing_banner_image';
        }

        if ($this->ad_type === 'banner' && blank($this->placement)) {
            $reasons[] = 'missing_placement';
        }

        $shows = $reasons === [];

        $status = match (true) {
            $shows => 'live',
            in_array('inactive', $reasons, true) => 'paused',
            in_array('scheduled', $reasons, true) => 'scheduled',
            in_array('expired', $reasons, true) => 'expired',
            default => 'hidden',
        };

        $placementEnum = $this->placement instanceof AdPlacement
            ? $this->placement
            : (is_string($this->placement) ? AdPlacement::tryFrom($this->placement) : null);

        $placements = [];
        if ($shows) {
            if ($this->ad_type === 'banner' && $placementEnum) {
                $placements = [$placementEnum->value];
            } elseif ($this->ad_type === 'featured_store') {
                $placements = [
                    'home_featured_stores',
                    'stores_list_featured',
                    'stores_list_sponsored_badge',
                ];
            }
        }

        $placementMeta = null;
        if ($placementEnum) {
            $placementMeta = [
                'id' => $placementEnum->value,
                'label_ar' => $placementEnum->labelAr(),
                'aspect_ratio' => $placementEnum->aspectRatio(),
                'recommended_size' => $placementEnum->recommendedSize(),
                'ui_variant' => $placementEnum->uiVariant(),
            ];
        }

        return [
            'shows_on_homepage' => $shows && (
                $this->ad_type === 'featured_store'
                || in_array($placementEnum?->value, [AdPlacement::HOME_HERO->value, AdPlacement::HOME_MID->value], true)
            ),
            'shows_publicly' => $shows,
            'status' => $status,
            'reasons' => $reasons,
            'placements' => $placements,
            'placement' => $placementEnum?->value,
            'placement_meta' => $placementMeta,
            'business_today' => $today,
        ];
    }
}
