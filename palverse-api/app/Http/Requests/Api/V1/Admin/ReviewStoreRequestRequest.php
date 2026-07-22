<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewStoreRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'string', 'in:approve,reject,request_changes,start_review'],
            'reason' => ['required_if:action,reject,request_changes', 'string', 'min:10', 'nullable'],
        ];
    }
}
