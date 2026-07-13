<?php

namespace App\Http\Requests\Api\V1\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class OfferIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'query' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'valid_now' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:created_at,sort_order,price,starts_at,ends_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
