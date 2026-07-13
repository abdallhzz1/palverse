<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Enums\UserStatus;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MerchantRegistrationService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Register a new merchant account via the public self-service endpoint.
     *
     * Steps (inside one transaction):
     *  1. Create user with Active status
     *  2. Assign merchant role
     *  3. Create audit event (actor = newly created user)
     *
     * Audit failure rolls back the entire transaction per project consistency strategy.
     *
     * @param  array{name: string, email: string, password: string, phone?: string|null, preferred_locale?: string|null}  $data
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $defaultLocale = $this->resolveDefaultLocale();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'preferred_locale' => $data['preferred_locale'] ?? $defaultLocale,
                'password' => $data['password'], // Hashed by cast
                'status' => UserStatus::Active,
                // created_by stays null — self-service
                // email_verified_at stays null — no email verification in MVP
            ]);

            $user->password_changed_at = now();
            $user->save();

            $user->assignRole('merchant');

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserRegistered,
                subject: $user,
                newValues: $user->only(['name', 'email', 'phone', 'preferred_locale', 'status', 'public_id']),
                actor: $user, // actor = newly registered user
                metadata: [
                    'registration_source' => 'public_api',
                    'role_assigned' => 'merchant',
                ]
            );

            return $user;
        });
    }

    /**
     * Resolve default locale from system settings, falling back to config/app.
     */
    private function resolveDefaultLocale(): string
    {
        try {
            /** @var SystemSetting|null $setting */
            $setting = SystemSetting::where('group', 'general')
                ->where('key', 'default_language')
                ->first();

            if ($setting && in_array($setting->value, ['ar', 'en'], true)) {
                return $setting->value;
            }
        } catch (\Throwable) {
            // Fall through to config default
        }

        return in_array(config('app.locale'), ['ar', 'en']) ? config('app.locale') : 'ar';
    }
}
