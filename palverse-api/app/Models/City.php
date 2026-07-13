<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $fillable = [
        'name_ar',
        'name_en',
    ];

    protected $hidden = [
        'id',
    ];

    /**
     * Zones that belong to this city.
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }
}
