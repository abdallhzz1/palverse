<?php

namespace App\Models;

use App\Enums\RefusalReasonCode;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RepresentativeRejectionReport extends Model
{
    use HasFactory, HasPublicId, SoftDeletes;

    protected $fillable = [
        'representative_id', 'zone_id',
        'business_name', 'owner_name', 'phone',
        'refusal_reason_code', 'refusal_reason_text',
        'contacted_at', 'follow_up_required', 'notes',
    ];

    protected $hidden = ['id', 'representative_id', 'zone_id'];

    protected $casts = [
        'refusal_reason_code' => RefusalReasonCode::class,
        'contacted_at' => 'datetime',
        'follow_up_required' => 'boolean',
    ];

    public function representative(): BelongsTo
    {
        return $this->belongsTo(User::class, 'representative_id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }
}
