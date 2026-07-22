<?php

namespace App\Models;

use App\Enums\StoreReviewStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreReview extends Model
{
    use HasFactory, HasPublicId;

    protected $fillable = [
        'store_id',
        'rating',
        'reviewer_name',
        'comment',
        'visitor_token_hash',
        'status',
        'reviewed_by',
        'published_at',
        'hidden_at',
        'is_reported',
        'report_reason',
        'reported_at',
    ];

    protected $hidden = [
        'id',
        'store_id',
        'visitor_token_hash',
        'reviewed_by',
        'is_reported',
        'report_reason',
        'reported_at',
        'hidden_at',
    ];

    protected $casts = [
        'status' => StoreReviewStatus::class,
        'published_at' => 'datetime',
        'hidden_at' => 'datetime',
        'reported_at' => 'datetime',
        'is_reported' => 'boolean',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
