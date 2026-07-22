<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use App\Enums\MerchantJoinRequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MerchantJoinRequest extends Model
{
    use HasFactory, SoftDeletes, HasPublicId;

    protected $fillable = [
        'merchant_name',
        'phone',
        'email',
        'store_name',
        'city_id',
        'notes',
        'status',
        'handled_by',
    ];

    protected $casts = [
        'status' => MerchantJoinRequestStatus::class,
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
