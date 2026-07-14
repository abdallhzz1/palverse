<?php

namespace App\Models\Traits;

use App\Services\PublicReferenceCacheService;

trait HasPublicReferenceCache
{
    /**
     * Get the domain name for cache invalidation.
     */
    abstract public function getCacheDomain(): string;

    /**
     * Boot the trait.
     */
    protected static function bootHasPublicReferenceCache(): void
    {
        static::saved(function ($model) {
            $model->invalidatePublicCache();
        });

        static::deleted(function ($model) {
            $model->invalidatePublicCache();
        });
    }

    /**
     * Invalidate the public cache for this model's domain.
     */
    public function invalidatePublicCache(): void
    {
        app(PublicReferenceCacheService::class)->invalidateDomain($this->getCacheDomain());
    }
}
