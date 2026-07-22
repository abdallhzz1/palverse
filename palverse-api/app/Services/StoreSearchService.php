<?php

namespace App\Services;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\Zone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class StoreSearchService
{
    /**
     * Search and filter stores based on query parameters.
     */
    public function search(array $filters): LengthAwarePaginator
    {
        $query = Store::publicVisible()
            ->with(['category', 'city', 'zone', 'logo', 'cover'])
            ->withCount('activeOffers');

        // 1. Text Search
        if (! empty($filters['query'])) {
            $textQuery = preg_replace('/\s+/', ' ', trim($filters['query']));
            $patterns = $this->generateArabicSearchPatterns($textQuery);

            $query->where(function ($b) use ($textQuery, $patterns) {
                // Main text fields search
                $b->where(function ($sq) use ($textQuery, $patterns) {
                    foreach ($patterns as $pattern) {
                        $sq->orWhere('name_ar', 'like', "%{$pattern}%")
                            ->orWhere('description_ar', 'like', "%{$pattern}%")
                            ->orWhere('address_ar', 'like', "%{$pattern}%");
                    }
                    $sq->orWhere('name_en', 'like', "%{$textQuery}%")
                        ->orWhere('description_en', 'like', "%{$textQuery}%")
                        ->orWhere('address_en', 'like', "%{$textQuery}%");
                });

                // Category name search
                $b->orWhereHas('category', function ($cq) use ($textQuery) {
                    $cq->where('name_ar', 'like', "%{$textQuery}%")
                        ->orWhere('name_en', 'like', "%{$textQuery}%");
                });

                // City name search
                $b->orWhereHas('city', function ($ccq) use ($textQuery) {
                    $ccq->where('name_ar', 'like', "%{$textQuery}%")
                        ->orWhere('name_en', 'like', "%{$textQuery}%");
                });

                // Zone name search
                $b->orWhereHas('zone', function ($czq) use ($textQuery) {
                    $czq->where('name_ar', 'like', "%{$textQuery}%")
                        ->orWhere('name_en', 'like', "%{$textQuery}%");
                });
            });
        }

        // 2. Category Filter (by slug)
        if (! empty($filters['category'])) {
            $category = Category::where('slug', $filters['category'])->first();
            if ($category) {
                $query->where('category_id', $category->id);
            } else {
                $query->where('id', 0);
            }
        }

        // 3. City Filter (by public_id)
        if (! empty($filters['city'])) {
            $city = City::where('public_id', $filters['city'])->first();
            if ($city) {
                $query->where('city_id', $city->id);
            } else {
                $query->where('id', 0);
            }
        }

        // 4. Zone Filter (by public_id)
        if (! empty($filters['zone'])) {
            $zone = Zone::where('public_id', $filters['zone'])->first();
            if ($zone) {
                $query->where('zone_id', $zone->id);
            } else {
                $query->where('id', 0);
            }
        }

        // 5. Offers Filter
        if (isset($filters['has_offers']) && filter_var($filters['has_offers'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('activeOffers');
        }

        if (isset($filters['offer_active_now']) && filter_var($filters['offer_active_now'], FILTER_VALIDATE_BOOLEAN)) {
            $now = Carbon::now();
            $query->whereHas('offers', function ($q) use ($now) {
                $q->where('is_active', true)
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now);
            });
        }

        // 6. Media Filter
        if (isset($filters['has_logo']) && filter_var($filters['has_logo'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('logo');
        }

        if (isset($filters['has_cover']) && filter_var($filters['has_cover'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('cover');
        }

        // 7. Featured Filter (Advertised Stores)
        if (isset($filters['is_featured']) && filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('advertisements', function ($q) {
                $q->where('is_active', true)
                  ->where('start_date', '<=', now()->toDateString())
                  ->where('end_date', '>=', now()->toDateString());
            });
        }

        // 7. Open Now Filter
        if (isset($filters['open_now']) && filter_var($filters['open_now'], FILTER_VALIDATE_BOOLEAN)) {
            $now = Carbon::now(config('app.timezone'));
            $dayOfWeek = $now->dayOfWeek;
            $timeStr = $now->format('H:i:s');

            $query->whereHas('workingHours', function ($q) use ($dayOfWeek, $timeStr) {
                $q->where('day_of_week', $dayOfWeek)
                    ->where('is_closed', false)
                    ->where('opens_at', '<=', $timeStr)
                    ->where('closes_at', '>=', $timeStr);
            });
        }

        // 8. Sorting
        $sort = $filters['sort'] ?? 'newest';
        $direction = strtolower($filters['direction'] ?? 'desc');

        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;

            case 'name_ar':
                $query->orderBy('name_ar', 'asc');
                break;

            case 'name_en':
                $query->orderBy('name_en', 'asc');
                break;

            case 'offers':
                $query->orderBy('active_offers_count', 'desc');
                break;

            case 'relevance':
                if (! empty($filters['query'])) {
                    $textQuery = preg_replace('/\s+/', ' ', trim($filters['query']));
                    $query->orderByRaw('
                        CASE 
                            WHEN name_ar = ? THEN 1
                            WHEN name_en = ? THEN 1
                            WHEN name_ar LIKE ? THEN 2
                            WHEN name_en LIKE ? THEN 2
                            WHEN name_ar LIKE ? THEN 3
                            WHEN name_en LIKE ? THEN 3
                            ELSE 4
                        END ASC
                    ', [
                        $textQuery,
                        $textQuery,
                        "{$textQuery}%",
                        "{$textQuery}%",
                        "%{$textQuery}%",
                        "%{$textQuery}%",
                    ]);
                } else {
                    $query->orderBy('created_at', 'desc');
                }
                break;

            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // 9. Pagination
        $perPage = (int) ($filters['per_page'] ?? config('palverse.search.default_limit', 20));
        $maxLimit = config('palverse.search.max_limit', 100);
        $perPage = min(max($perPage, 1), $maxLimit);

        return $query->paginate($perPage);
    }

    /**
     * Generate wildcard-supported search strings for Arabic.
     */
    public function generateArabicSearchPatterns(string $query): array
    {
        $patterns = [$query];

        // Tatweel removal
        $clean = str_replace('ـ', '', $query);
        if ($clean !== $query) {
            $patterns[] = $clean;
        }

        // Replace Yeh / Maksura with wildcard '_' to match variants
        $yeh = preg_replace('/[ىي]/u', '_', $clean);
        if ($yeh !== $clean) {
            $patterns[] = $yeh;
        }

        // Replace Alef variants with wildcard '_' to match variants
        $alef = preg_replace('/[أإآا]/u', '_', $clean);
        if ($alef !== $clean) {
            $patterns[] = $alef;
        }

        return array_values(array_unique($patterns));
    }
}
