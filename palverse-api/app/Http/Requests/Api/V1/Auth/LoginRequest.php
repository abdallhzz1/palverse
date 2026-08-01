<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            // Preferred field: email or phone
            'login' => ['nullable', 'string', 'max:255'],
            // Backward-compatible alias
            'email' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:100'],
            'device_type' => ['nullable', 'string', 'in:web,android,ios,unknown'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (blank($this->input('login')) && blank($this->input('email'))) {
                $validator->errors()->add('login', 'أدخل البريد الإلكتروني أو رقم الهاتف.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $login = $this->input('login', $this->input('email'));

        if (is_string($login)) {
            $login = trim($login);
            if (str_contains($login, '@')) {
                $login = mb_strtolower($login);
            }
            $this->merge([
                'login' => $login,
            ]);
        }
    }

    public function loginIdentifier(): string
    {
        return (string) ($this->validated('login') ?? $this->validated('email') ?? '');
    }
}
