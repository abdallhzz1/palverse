<?php

namespace App\Models;

use App\Enums\RepresentativeStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class RepresentativeProfile extends Model
{
    use HasFactory, HasPublicId, SoftDeletes;

    protected $fillable = [
        'user_id', 'employee_code', 'phone', 'status', 'notes',
        'hired_at', 'activated_at', 'deactivated_at',
    ];

    protected $hidden = ['id', 'user_id'];

    protected $casts = [
        'status' => RepresentativeStatus::class,
        'hired_at' => 'date',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
