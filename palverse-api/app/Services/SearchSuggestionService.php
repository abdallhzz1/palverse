<?php

namespace App\Services;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\Zone;

class SearchSuggestionService
{
    /**
     * Retrieve and rank unified search suggestions.
     */
    public function getSuggestions(string $query, array $types, int $limit = 8): array
    {
        $textQuery = preg_replace('/\s+/', ' ', trim($query));
        if (mb_strlen($textQuery) < config('palverse.search.min_query_length_suggestions', 2)) {
            return [];
        }

        $results = [];

        // 1. Stores
        if (in_array('stores', $types)) {
            $stores = Store::publicVisible()
                ->with('category')
                ->where(function ($q) use ($textQuery) {
                    $q->where('name_ar', 'like', "%{$textQuery}%")
                        ->orWhere('name_en', 'like', "%{$textQuery}%");
                })
                ->limit($limit)
                ->get()
                ->map(fn ($s) => [
                    'type' => 'store',
                    'public_id' => $s->public_id,
                    'slug' => $s->slug,
                    'label_ar' => $s->name_ar,
                    'label_en' => $s->name_en,
                    'secondary_label_ar' => $s->category ? $s->category->name_ar : null,
                    'secondary_label_en' => $s->category ? $s->category->name_en : null,
                    'url' => "/stores/{$s->slug}",
                ]);
            $results = array_merge($results, $stores->toArray());
        }

        // 2. Categories
        if (in_array('categories', $types)) {
            $categories = Category::where('name_ar', 'like', "%{$textQuery}%")
                ->orWhere('name_en', 'like', "%{$textQuery}%")
                ->limit($limit)
                ->get()
                ->map(fn ($c) => [
                    'type' => 'category',
                    'public_id' => $c->public_id,
                    'slug' => $c->slug,
                    'label_ar' => $c->name_ar,
                    'label_en' => $c->name_en,
                    'secondary_label_ar' => null,
                    'secondary_label_en' => null,
                    'url' => "/categories/{$c->slug}",
                ]);
            $results = array_merge($results, $categories->toArray());
        }

        // 3. Cities
        if (in_array('cities', $types)) {
            $cities = City::where('name_ar', 'like', "%{$textQuery}%")
                ->orWhere('name_en', 'like', "%{$textQuery}%")
                ->limit($limit)
                ->get()
                ->map(fn ($c) => [
                    'type' => 'city',
                    'public_id' => $c->public_id,
                    'slug' => null,
                    'label_ar' => $c->name_ar,
                    'label_en' => $c->name_en,
                    'secondary_label_ar' => null,
                    'secondary_label_en' => null,
                    'url' => null,
                ]);
            $results = array_merge($results, $cities->toArray());
        }

        // 4. Zones
        if (in_array('zones', $types)) {
            $zones = Zone::with('city')
                ->where('name_ar', 'like', "%{$textQuery}%")
                ->orWhere('name_en', 'like', "%{$textQuery}%")
                ->limit($limit)
                ->get()
                ->map(fn ($z) => [
                    'type' => 'zone',
                    'public_id' => $z->public_id,
                    'slug' => null,
                    'label_ar' => $z->name_ar,
                    'label_en' => $z->name_en,
                    'secondary_label_ar' => $z->city ? $z->city->name_ar : null,
                    'secondary_label_en' => $z->city ? $z->city->name_en : null,
                    'url' => null,
                ]);
            $results = array_merge($results, $zones->toArray());
        }

        // Rank the merged results
        usort($results, function ($a, $b) use ($textQuery) {
            $queryLower = mb_strtolower($textQuery);

            // Priority 1: Exact match on label
            $exactA = (mb_strtolower($a['label_ar']) === $queryLower || mb_strtolower($a['label_en']) === $queryLower);
            $exactB = (mb_strtolower($b['label_ar']) === $queryLower || mb_strtolower($b['label_en']) === $queryLower);
            if ($exactA && ! $exactB) {
                return -1;
            }
            if (! $exactA && $exactB) {
                return 1;
            }

            // Priority 2: Starts with label
            $startsA = (str_starts_with(mb_strtolower($a['label_ar']), $queryLower) || str_starts_with(mb_strtolower($a['label_en']), $queryLower));
            $startsB = (str_starts_with(mb_strtolower($b['label_ar']), $queryLower) || str_starts_with(mb_strtolower($b['label_en']), $queryLower));
            if ($startsA && ! $startsB) {
                return -1;
            }
            if (! $startsA && $startsB) {
                return 1;
            }

            // Priority 3: Type priority (store -> category -> city -> zone)
            $typeOrder = ['store' => 1, 'category' => 2, 'city' => 3, 'zone' => 4];
            $orderA = $typeOrder[$a['type']] ?? 99;
            $orderB = $typeOrder[$b['type']] ?? 99;
            if ($orderA !== $orderB) {
                return $orderA <=> $orderB;
            }

            return strcmp($a['label_en'] ?? $a['label_ar'], $b['label_en'] ?? $b['label_ar']);
        });

        // Enforce global limit
        return array_slice($results, 0, $limit);
    }
}
