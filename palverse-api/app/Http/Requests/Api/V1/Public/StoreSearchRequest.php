<?php

namespace App\Http\Requests\Api\V1\Public;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $booleanFields = ['has_offers', 'offer_active_now', 'has_logo', 'has_cover', 'open_now'];
        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $val = $this->input($field);
                if ($val === 'true' || $val === '1' || $val === 1 || $val === true) {
                    $this->merge([$field => true]);
                } elseif ($val === 'false' || $val === '0' || $val === 0 || $val === false) {
                    $this->merge([$field => false]);
                }
            }
        }
    }

    public function rules(): array
    {
        $maxLen = config('palverse.search.max_query_length', 100);
        $maxLimit = config('palverse.search.max_limit', 100);

        return [
            'query' => ['nullable', 'string', "max:{$maxLen}"],
            'category' => ['nullable', 'string', 'max:180'],
            'city' => ['nullable', 'string'],
            'zone' => ['nullable', 'string'],
            'has_offers' => ['nullable', 'boolean'],
            'offer_active_now' => ['nullable', 'boolean'],
            'has_logo' => ['nullable', 'boolean'],
            'has_cover' => ['nullable', 'boolean'],
            'open_now' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:newest,oldest,name_ar,name_en,offers,relevance'],
            'direction' => ['nullable', 'string', 'in:asc,desc,ASC,DESC'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', "between:1,{$maxLimit}"],
        ];
    }

    /**
     * Force standard JSON validation response format.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => __('Validation failed.'),
            'errors' => $validator->errors(),
        ], 422));
    }

    /**
     * Perform custom checks like city-zone association.
     */
    protected function passedValidation(): void
    {
        $cityId = $this->input('city');
        $zoneId = $this->input('zone');

        if ($cityId && $zoneId) {
            $city = City::where('public_id', $cityId)->first();
            $zone = Zone::where('public_id', $zoneId)->first();

            if ($city && $zone && $zone->city_id !== $city->id) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => __('Validation failed.'),
                    'errors' => [
                        'zone' => [__('The selected zone does not belong to the selected city.')],
                    ],
                    'error' => [
                        'code' => 'SEARCH_ZONE_CITY_MISMATCH',
                        'details' => [],
                    ],
                ], 422));
            }
        }

        if ($this->filled('query')) {
            $normalizedQuery = preg_replace('/\s+/', ' ', trim($this->input('query')));
            $this->merge(['query' => $normalizedQuery]);
        }
    }
}
