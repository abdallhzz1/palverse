<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\AuditAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuditLogIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('audit_logs.view');
    }

    public function rules(): array
    {
        return [
            'action' => ['nullable', 'string', Rule::enum(AuditAction::class)],
            'actor_public_id' => ['nullable', 'string', 'max:50'],
            'subject_type' => ['nullable', 'string', 'max:150'],
            'subject_public_id' => ['nullable', 'string', 'max:50'],
            'request_id' => ['nullable', 'string', 'max:100'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            'query' => ['nullable', 'string', 'max:150'],
            'sort' => ['nullable', 'string', Rule::in(['newest', 'oldest'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
