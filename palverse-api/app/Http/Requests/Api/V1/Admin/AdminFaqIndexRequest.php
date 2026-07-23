<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Concerns\NormalizesBooleanQueryParams;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminFaqIndexRequest extends FormRequest
{
    use NormalizesBooleanQueryParams;

    public function authorize(): bool
    {
        return $this->user()->can('settings.view');
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeBooleanQueryParams(['is_active']);
    }

    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:150'],
            'is_active' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:sort_order,created_at,question_ar,question_en'],
            'direction' => ['nullable', 'string', 'in:asc,desc,ASC,DESC'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => __('Validation failed.'),
            'errors' => $validator->errors(),
        ], 422));
    }
}
