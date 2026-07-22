<?php

namespace App\Http\Requests\Api\V1\Representative;

use App\Enums\RefusalReasonCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class CreateRejectionReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zone_public_id' => ['required', 'string', 'exists:zones,public_id'],
            'business_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'refusal_reason_code' => ['required', new Enum(RefusalReasonCode::class)],
            'refusal_reason_text' => ['nullable', 'string'],
            'contacted_at' => ['required', 'date'],
            'follow_up_required' => ['required', 'boolean'],
            'notes' => ['nullable', 'string'],
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
