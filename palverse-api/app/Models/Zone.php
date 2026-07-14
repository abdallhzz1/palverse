<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use App\Models\Traits\HasPublicReferenceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Zone extends Model
{
    use HasFactory;
    use HasPublicId;
    use HasPublicReferenceCache;

    public function getCacheDomain(): string
    {
        return 'cities'; // City and Zone cache is cleared together via 'cities'
    }

    protected $fillable = [
        'city_id',
        'name_ar',
        'name_en',
    ];

    protected $hidden = [
        'id',
        'city_id',
    ];

    /**
     * The city this zone belongs to.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
