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

    protected function prepareForValidation(): void
    {
        if ($this->has('city_public_id')) {
            $city = \App\Models\City::where('public_id', $this->input('city_public_id'))->first();
            if ($city) {
                $this->merge([
                    'city_id' => $city->id,
                ]);
            }
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'city_public_id' => ['sometimes', 'required', 'string', Rule::exists('cities', 'public_id')],
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
