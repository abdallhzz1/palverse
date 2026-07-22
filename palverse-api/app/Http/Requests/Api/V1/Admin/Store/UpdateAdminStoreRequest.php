<?php

namespace App\Http\Requests\Api\V1\Admin\Store;

use App\Models\City;
use App\Models\Store;
use App\Models\Zone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $store = Store::where('public_id', $this->route('publicId'))->first();

        if (! $store) {
            return false;
        }

        return $this->user()?->can('update', $store) ?? false;
    }

    public function rules(): array
    {
        return [
            'category_public_id' => ['sometimes', 'string', Rule::exists('categories', 'public_id')],
            'city_public_id' => ['sometimes', 'string', Rule::exists('cities', 'public_id')],
            'zone_public_id' => [
                'sometimes',
                'string',
                function ($attribute, $value, $fail) {
                    $zone = Zone::where('public_id', $value)->first();
                    if (! $zone) {
                        $fail('The selected zone is invalid or deleted.');

                        return;
                    }

                    $cityPublicId = $this->input('city_public_id');
                    if ($cityPublicId) {
                        $city = City::where('public_id', $cityPublicId)->first();
                        if ($city && $zone->city_id !== $city->id) {
                            $fail('The selected zone does not belong to the selected city.');
                        }
                    } else {
                        $store = Store::where('public_id', $this->route('publicId'))->first();
                        if ($store && $zone->city_id !== $store->city_id) {
                            $fail('The selected zone does not belong to the current store city.');
                        }
                    }
                },
            ],
            'name_ar' => ['sometimes', 'string', 'max:180'],
            'name_en' => ['nullable', 'string', 'max:180'],
            'description_ar' => ['sometimes', 'string'],
            'description_en' => ['nullable', 'string'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:2048'],
            'address_ar' => ['sometimes', 'string', 'max:500'],
            'address_en' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'required_with:longitude', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_with:latitude', 'numeric', 'between:-180,180'],
        ];
    }
}
