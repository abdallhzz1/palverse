<?php

namespace App\Http\Requests\Api\V1\Admin\Zone;

use App\Models\City;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('zones.manage') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('city_public_id') && ! $this->filled('city_id')) {
            $cityId = City::query()
                ->where('public_id', $this->input('city_public_id'))
                ->value('id');

            if ($cityId) {
                $this->merge(['city_id' => $cityId]);
            }
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'city_public_id' => [
                'required_without:city_id',
                'nullable',
                'string',
                Rule::exists('cities', 'public_id'),
            ],
            'city_id' => [
                'required_without:city_public_id',
                'nullable',
                'integer',
                Rule::exists('cities', 'id'),
            ],
            'name_ar' => [
                'required',
                'string',
                'max:191',
                Rule::unique('zones', 'name_ar')->where(
                    fn ($query) => $query->where('city_id', $this->input('city_id'))
                ),
            ],
            'name_en' => ['nullable', 'string', 'max:191'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'city_public_id.required_without' => 'يجب اختيار المدينة.',
            'city_public_id.exists' => 'المدينة المحددة غير موجودة.',
            'city_id.required_without' => 'يجب اختيار المدينة.',
            'city_id.exists' => 'المدينة المحددة غير موجودة.',
            'name_ar.required' => 'اسم المنطقة بالعربية مطلوب.',
            'name_ar.unique' => 'يوجد منطقة بنفس الاسم في هذه المدينة مسبقاً.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->filled('city_public_id') && ! $this->filled('city_id')) {
                $validator->errors()->add('city_public_id', 'المدينة المحددة غير موجودة.');
            }
        });
    }

    /**
     * Fields safe to persist on Zone.
     *
     * @return array{city_id: int, name_ar: string, name_en: ?string}
     */
    public function zoneAttributes(): array
    {
        /** @var array{city_id: int, name_ar: string, name_en?: string|null} $data */
        $data = $this->safe()->only(['city_id', 'name_ar', 'name_en']);

        return [
            'city_id' => (int) $data['city_id'],
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'] ?? null,
        ];
    }
}
