<?php

namespace App\Http\Requests\Api\V1\Admin\Zone;

use App\Models\Zone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateZoneRequest extends FormRequest
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
        $publicId = $this->route('publicId');
        $zone = Zone::where('public_id', $publicId)->first();

        // city_id stays the zone's own city unless explicitly moved (not supported in MVP)
        $cityId = $zone?->city_id;

        return [
            'name_ar' => [
                'sometimes',
                'required',
                'string',
                'max:191',
                Rule::unique('zones', 'name_ar')
                    ->where('city_id', $cityId)
                    ->ignore($zone?->id),
            ],
            'name_en' => ['sometimes', 'nullable', 'string', 'max:191'],
        ];
    }
}
