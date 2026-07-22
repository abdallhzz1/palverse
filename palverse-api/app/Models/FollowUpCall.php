<?php

namespace App\Models;

use App\Enums\CallOutcome;
use App\Enums\CallType;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FollowUpCall extends Model
{
    use HasPublicId, SoftDeletes;

    protected $fillable = [
        'follow_up_user_id',
        'merchant_user_id',
        'store_id',
        'subscription_id',
        'representative_id',
        'call_type',
        'outcome',
        'contact_phone',
        'contacted_at',
        'next_action_at',
        'notes',
        'satisfaction_score',
    ];

    protected $casts = [
        'call_type' => CallType::class,
        'outcome' => CallOutcome::class,
        'contacted_at' => 'datetime',
        'next_action_at' => 'datetime',
    ];

    public function followUpUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follow_up_user_id');
    }

    public function merchantUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_user_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(StoreSubscription::class);
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(User::class, 'representative_id');
    }
}
