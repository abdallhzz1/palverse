<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\SearchSuggestionService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SearchSuggestionController extends Controller
{
    protected SearchSuggestionService $suggestionService;

    public function __construct(SearchSuggestionService $suggestionService)
    {
        $this->suggestionService = $suggestionService;
    }

    /**
     * Get search suggestions.
     */
    public function suggest(Request $request): JsonResponse
    {
        $maxLen = config('palverse.search.max_query_length', 100);

        $validator = Validator::make($request->all(), [
            'query' => ['required', 'string', 'min:2', "max:{$maxLen}"],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
            'types' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => __('Validation failed.'),
                'errors' => $validator->errors(),
            ], 422));
        }

        $query = $request->input('query');
        $limit = (int) $request->input('limit', config('palverse.search.suggestions_default_limit', 8));

        $typesStr = $request->input('types', 'stores,categories,cities');
        $types = explode(',', $typesStr);
        $types = array_map('trim', $types);

        // Sanitize allowed types
        $allowedTypes = ['stores', 'categories', 'cities', 'zones'];
        $types = array_intersect($types, $allowedTypes);

        if (empty($types)) {
            $types = ['stores', 'categories', 'cities'];
        }

        $suggestions = $this->suggestionService->getSuggestions($query, $types, $limit);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الاقتراحات بنجاح.',
            'data' => $suggestions,
            'meta' => [
                'query' => $query,
                'types' => $types,
                'limit' => $limit,
                'result_count' => count($suggestions),
            ],
        ]);
    }
}
