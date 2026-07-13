<?php

namespace App\Http\Requests\Api\V1\Admin\City;

use App\Models\City;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('cities.manage') ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $publicId = $this->route('publicId');
        $city = City::where('public_id', $publicId)->first();

        return [
            'name_ar' => [
                'sometimes',
                'required',
                'string',
                'max:191',
                Rule::unique('cities', 'name_ar')->ignore($city?->id),
            ],
            'name_en' => [
                'sometimes',
                'nullable',
                'string',
                'max:191',
                Rule::unique('cities', 'name_en')->ignore($city?->id),
            ],
        ];
    }
}
