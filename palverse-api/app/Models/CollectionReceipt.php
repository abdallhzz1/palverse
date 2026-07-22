<?php

namespace App\Models;

use App\Enums\CollectionReceiptStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CollectionReceipt extends Model
{
    use HasFactory, HasPublicId, SoftDeletes;

    protected $fillable = [
        'representative_id', 'store_id', 'store_registration_request_id',
        'receipt_number', 'amount', 'currency', 'payment_purpose',
        'collected_at', 'notes', 'status',
        'issued_by', 'settled_by', 'cancelled_by',
    ];

    protected $hidden = [
        'id', 'representative_id', 'store_id', 'store_registration_request_id',
        'issued_by', 'settled_by', 'cancelled_by',
    ];

    protected $casts = [
        'status' => CollectionReceiptStatus::class,
        'amount' => 'decimal:2',
        'collected_at' => 'datetime',
        'settled_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function representative(): BelongsTo
    {
        return $this->belongsTo(User::class, 'representative_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(StoreRegistrationRequest::class, 'store_registration_request_id');
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function settledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'settled_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
