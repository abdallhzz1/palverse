<?php

namespace App\Models;

use App\Enums\CommissionStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommissionRecord extends Model
{
    use HasFactory, HasPublicId, SoftDeletes;

    protected $fillable = [
        'representative_id', 'store_registration_request_id', 'store_id',
        'amount', 'currency', 'status', 'reason',
        'earned_at', 'approved_at', 'paid_at', 'notes',
        'approved_by', 'paid_by',
    ];

    protected $hidden = [
        'id', 'representative_id', 'store_registration_request_id', 'store_id',
        'approved_by', 'paid_by',
    ];

    protected $casts = [
        'status' => CommissionStatus::class,
        'amount' => 'decimal:2',
        'earned_at' => 'datetime',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function representative(): BelongsTo
    {
        return $this->belongsTo(User::class, 'representative_id');
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(StoreRegistrationRequest::class, 'store_registration_request_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
