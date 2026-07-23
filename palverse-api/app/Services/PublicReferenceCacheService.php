<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class PublicReferenceCacheService
{
    /**
     * Get the configured TTL in seconds for reference data.
     * Defaults to 3600 (1 hour) if not configured.
     */
    protected function getReferenceTtl(): int
    {
        return (int) config('palverse.cache.reference_ttl', 3600);
    }

    /**
     * Get the configured TTL in seconds for the bootstrap endpoint.
     */
    protected function getBootstrapTtl(): int
    {
        return (int) config('palverse.cache.bootstrap_ttl', 300);
    }

    /**
     * Determine if caching is enabled.
     */
    protected function isCacheEnabled(): bool
    {
        return $this->getReferenceTtl() > 0;
    }

    protected function versionKey(string $domain): string
    {
        return "palverse:v1:{$domain}:__version";
    }

    protected function getDomainVersion(string $domain): int
    {
        try {
            return max(1, (int) Cache::get($this->versionKey($domain), 1));
        } catch (\Exception $e) {
            return 1;
        }
    }

    /**
     * Generates a deterministic cache key.
     * Domain versions bump on invalidateDomain so parameterized keys (e.g. slug) are invalidated too.
     */
    protected function buildKey(string $domain, array $params = []): string
    {
        if ($domain === 'bootstrap') {
            return 'palverse:v1:bootstrap';
        }

        $version = $this->getDomainVersion($domain);
        $hash = empty($params) ? '' : md5(json_encode($params));

        return "palverse:v1:{$domain}:v{$version}".($hash ? ":{$hash}" : '');
    }

    /**
     * Execute a callback and cache the result.
     * Falls back to executing the callback without caching if cache throws an exception (graceful degradation).
     */
    public function remember(string $domain, array $params, callable $callback, ?int $customTtl = null)
    {
        if (! $this->isCacheEnabled()) {
            return $callback();
        }

        $ttl = $customTtl ?? $this->getReferenceTtl();
        $key = $this->buildKey($domain, $params);

        try {
            return Cache::remember($key, $ttl, $callback);
        } catch (\Exception $e) {
            \Log::warning("Cache failed for {$key}", ['error' => $e->getMessage()]);

            return $callback();
        }
    }

    /**
     * Like remember(), but never caches a null result (avoids sticky 404s for pages/categories).
     */
    public function rememberPresent(string $domain, array $params, callable $callback, ?int $customTtl = null)
    {
        if (! $this->isCacheEnabled()) {
            return $callback();
        }

        $ttl = $customTtl ?? $this->getReferenceTtl();
        $key = $this->buildKey($domain, $params);

        try {
            if (Cache::has($key)) {
                return Cache::get($key);
            }

            $value = $callback();
            if ($value !== null) {
                Cache::put($key, $value, $ttl);
            }

            return $value;
        } catch (\Exception $e) {
            \Log::warning("Cache failed for {$key}", ['error' => $e->getMessage()]);

            return $callback();
        }
    }

    /**
     * Invalidate all cached data for a specific domain (including parameterized keys).
     */
    public function invalidateDomain(string $domain): void
    {
        try {
            $versionKey = $this->versionKey($domain);
            if (Cache::get($versionKey) === null) {
                Cache::forever($versionKey, 2);
            } else {
                Cache::increment($versionKey);
            }

            Cache::forget($this->buildKey('bootstrap'));
        } catch (\Exception $e) {
            \Log::warning("Cache invalidation failed for {$domain}", ['error' => $e->getMessage()]);
        }
    }

    /**
     * Dedicated method for the bootstrap endpoint since it has a different TTL.
     */
    public function rememberBootstrap(callable $callback)
    {
        if ($this->getBootstrapTtl() <= 0) {
            return $callback();
        }

        try {
            return Cache::remember($this->buildKey('bootstrap'), $this->getBootstrapTtl(), $callback);
        } catch (\Exception $e) {
            return $callback();
        }
    }
}
