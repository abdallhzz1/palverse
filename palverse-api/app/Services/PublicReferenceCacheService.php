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

    /**
     * Generates a deterministic cache key.
     */
    protected function buildKey(string $domain, array $params = []): string
    {
        $hash = empty($params) ? '' : md5(json_encode($params));

        return "palverse:v1:{$domain}".($hash ? ":{$hash}" : '');
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
     * Invalidate all cached data for a specific domain.
     * Note: In MVP without cache tags, we may need to flush specific known keys or rely on TTL.
     * If tags are available (Redis/Memcached), we can use them, but we must support simple database cache too.
     * Since tags aren't supported on file/database drivers, we must rely on explicit key clearing or versioning.
     * For now, we clear the known base keys, but paginated endpoints will rely on TTL.
     */
    public function invalidateDomain(string $domain): void
    {
        // For endpoints that don't have parameters (like 'categories', 'cities', 'zones', 'plans', 'faqs')
        // We can just clear the base key.
        try {
            Cache::forget($this->buildKey($domain));
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
