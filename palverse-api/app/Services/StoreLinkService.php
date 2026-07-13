<?php

namespace App\Services;

use App\Models\Store;
use DomainException;

class StoreLinkService
{
    /**
     * Generate the canonical public web URL for a store.
     *
     * @throws DomainException
     */
    public function generateWebUrl(Store $store): string
    {
        if (empty($store->slug)) {
            throw new DomainException('STORE_SLUG_NOT_AVAILABLE');
        }

        $baseUrl = rtrim(config('palverse.public_web_url', 'http://localhost:3000'), '/');

        return $baseUrl.'/stores/'.$store->slug;
    }

    /**
     * Generate the custom protocol deep link for the store in the mobile application.
     *
     * @throws DomainException
     */
    public function generateDeepLink(Store $store): string
    {
        if (empty($store->slug)) {
            throw new DomainException('STORE_SLUG_NOT_AVAILABLE');
        }

        return 'palverse://stores/'.$store->slug;
    }

    /**
     * Retrieve all link-related details for a store.
     */
    public function getLinkData(Store $store): array
    {
        return [
            'store_public_id' => $store->public_id,
            'slug' => $store->slug,
            'web_url' => $this->generateWebUrl($store),
            'deep_link' => $this->generateDeepLink($store),
            'is_publicly_visible' => $store->isPubliclyVisible(),
        ];
    }
}
