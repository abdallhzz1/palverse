<?php

namespace App\Http\Requests\Api\V1\Admin\City;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('cities.manage') ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:191', 'unique:cities,name_ar'],
            'name_en' => ['nullable', 'string', 'max:191', 'unique:cities,name_en'],
        ];
    }
}
