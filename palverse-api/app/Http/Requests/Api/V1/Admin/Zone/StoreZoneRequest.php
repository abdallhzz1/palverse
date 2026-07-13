<?php

namespace App\Http\Requests\Api\V1\Admin\Zone;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('zones.manage') ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'city_id' => ['required', 'integer', Rule::exists('cities', 'id')],
            'name_ar' => [
                'required',
                'string',
                'max:191',
                Rule::unique('zones', 'name_ar')->where('city_id', $this->input('city_id')),
            ],
            'name_en' => ['nullable', 'string', 'max:191'],
        ];
    }
}
