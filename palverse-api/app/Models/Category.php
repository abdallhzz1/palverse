<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use App\Models\Concerns\HasSlug;
use App\Models\Traits\HasPublicReferenceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;
    use HasPublicId;
    use HasPublicReferenceCache;
    use HasSlug;

    public function getCacheDomain(): string
    {
        return 'categories';
    }

    protected $fillable = [
        'name_ar',
        'name_en',
        'slug',
        'icon',
    ];

    protected $hidden = [
        'id',
    ];

    /**
     * Stores that use this category as their primary category.
     */
    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }

    /**
     * Stores that list this category as a specialty (including primary).
     */
    public function specialtyStores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class, 'category_store')
            ->withTimestamps();
    }
}
