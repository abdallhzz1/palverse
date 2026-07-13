<?php

namespace App\Services;

use App\Models\Store;
use Illuminate\Support\Str;

class StoreSlugService
{
    /**
     * Generate a stable, unique slug for a store.
     * Uses English name if available, otherwise Arabic.
     * Falls back to public_id if slug generation fails.
     */
    public function generateUniqueSlug(Store $store): string
    {
        if ($store->slug) {
            return $store->slug;
        }

        $baseString = $store->name_en ?: $store->name_ar;

        // Handle Arabic slugs safely using Laravel's Str::slug which supports dictionaries and transliteration,
        // but if it produces empty, we handle it.
        $slug = Str::slug($baseString);

        // Fallback for names that might not produce a valid slug
        if (empty($slug)) {
            // Some Arabic strings might get completely stripped by simple Str::slug.
            // Using a simple regex replacement or just falling back to public_id.
            $slug = preg_replace('/\s+/u', '-', trim($baseString));
        }

        if (empty($slug) || $slug === '-') {
            $slug = $store->public_id;
        }

        return $this->makeUnique($slug, $store->id);
    }

    private function makeUnique(string $slug, ?int $ignoreId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?int $ignoreId): bool
    {
        $query = Store::where('slug', $slug);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}
