<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;
    use HasPublicId;
    use HasSlug;

    protected $fillable = [
        'name_ar',
        'name_en',
        'slug',
    ];

    protected $hidden = [
        'id',
    ];

    /**
     * Stores that belong to this category.
     */
    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }
}
