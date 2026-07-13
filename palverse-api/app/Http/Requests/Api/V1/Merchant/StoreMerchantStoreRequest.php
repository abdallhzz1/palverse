<?php

namespace App\Http\Requests\Api\V1\Merchant;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMerchantStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stores.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_public_id' => [
                'required',
                'string',
                Rule::exists('categories', 'public_id'),
            ],
            'city_public_id' => [
                'required',
                'string',
                Rule::exists('cities', 'public_id'),
            ],
            'zone_public_id' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $zone = Zone::where('public_id', $value)->first();
                    if (! $zone) {
                        $fail('The selected zone is invalid or deleted.');

                        return;
                    }

                    $city = City::where('public_id', $this->input('city_public_id'))->first();
                    if ($city && $zone->city_id !== $city->id) {
                        $fail('The selected zone does not belong to the selected city.');
                    }
                },
            ],
            'name_ar' => ['required', 'string', 'max:180'],
            'name_en' => ['nullable', 'string', 'max:180'],
            'description_ar' => ['required', 'string'],
            'description_en' => ['nullable', 'string'],
            'phone' => ['required', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:2048'],
            'address_ar' => ['required', 'string', 'max:500'],
            'address_en' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
