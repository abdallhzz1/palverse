<?php

namespace App\Http\Requests\Api\V1\Representative;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateStoreRegistrationRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zone_public_id' => ['required', 'string', 'exists:zones,public_id'],
            'city_public_id' => ['required', 'string', 'exists:cities,public_id'],
            'category_public_id' => ['nullable', 'string', 'exists:categories,public_id'],
            
            'proposed_merchant_name' => ['required', 'string', 'max:255'],
            'proposed_merchant_phone' => ['required', 'string', 'max:30'],
            'proposed_merchant_email' => ['nullable', 'email', 'max:255'],
            
            'store_name_ar' => ['required', 'string', 'max:255'],
            'store_name_en' => ['nullable', 'string', 'max:255'],
            'description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'phone' => ['required', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'address_ar' => ['required', 'string', 'max:500'],
            'address_en' => ['nullable', 'string', 'max:500'],
            
            'latitude' => ['nullable', 'required_with:longitude', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_with:latitude', 'numeric', 'between:-180,180'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'representative_notes' => ['nullable', 'string', 'max:1000'],
            'working_hours' => ['nullable', 'array'],
            'working_hours.days' => ['required_with:working_hours', 'array', 'size:7'],
            'working_hours.days.*.day_of_week' => ['required_with:working_hours', 'integer', 'between:0,6'],
            'working_hours.days.*.is_closed' => ['required_with:working_hours', 'boolean'],
            'working_hours.days.*.periods' => ['nullable', 'array'],
            'working_hours.days.*.periods.*.opens_at' => ['required_with:working_hours.days.*.periods', 'date_format:H:i'],
            'working_hours.days.*.periods.*.closes_at' => ['required_with:working_hours.days.*.periods', 'date_format:H:i'],
            'social_links' => ['nullable', 'array', 'max:20'],
            'social_links.*.platform' => ['required_with:social_links', 'string', 'in:facebook,instagram,tiktok,linkedin,youtube,x,telegram,snapchat,other'],
            'social_links.*.url' => ['required_with:social_links', 'url', 'max:500'],
            'social_links.*.username' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $zonePublicId = $this->input('zone_public_id');
                if ($zonePublicId) {
                    $zone = \App\Models\Zone::where('public_id', $zonePublicId)->first();
                    if ($zone) {
                        $hasAssignment = \App\Models\RepresentativeZoneAssignment::where('representative_id', $this->user()->id)
                            ->where('zone_id', $zone->id)
                            ->where('is_active', true)
                            ->exists();
                        if (!$hasAssignment) {
                            $validator->errors()->add('zone_public_id', 'يجب أن تكون المنطقة ضمن مناطقك المخصصة.');
                        }
                    }
                }
            }
        ];
    }
}
