<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreRequestStatusHistory extends Model
{
    use HasFactory;
    
    public $timestamps = true;
    
    protected $table = 'store_request_status_history';

    protected $fillable = ['request_id', 'actor_id', 'from_status', 'to_status', 'note'];
    
    protected $hidden = ['id', 'request_id', 'actor_id'];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(StoreRegistrationRequest::class, 'request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
