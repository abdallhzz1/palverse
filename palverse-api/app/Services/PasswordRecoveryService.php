<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\User;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;

class PasswordRecoveryService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected AuthTokenService $tokenService
    ) {}

    /**
     * Send a password reset link to the given email address.
     *
     * Security guarantees:
     *  - Always returns a generic status regardless of whether the email exists.
     *  - Does not reveal whether a user was found or not.
     *  - Sends notification only for existing non-deleted users.
     *  - Allows reset for active, inactive, and suspended accounts.
     *
     * @return bool True if the email was sent; false for unknown email or broker throttle (caller should treat both as success)
     */
    public function sendResetLink(string $email): bool
    {
        // Laravel Password broker handles: user lookup, token generation, sending notification.
        // Password::RESET_THROTTLED means the user must wait before another link can be sent.
        // We intentionally return the same "success" to the API regardless.
        $status = Password::sendResetLink(['email' => $email]);

        return in_array($status, [Password::RESET_LINK_SENT, Password::RESET_THROTTLED], true);
    }

    /**
     * Reset the user's password using the provided token.
     *
     * Steps (inside one transaction via Laravel's Password broker callback):
     *  1. Laravel verifies token validity and expiry
     *  2. New password is hashed and saved
     *  3. password_changed_at is set to now
     *  4. All Sanctum personal access tokens are revoked
     *  5. Audit event recorded
     *  6. Optional: PasswordChangedNotification sent (non-blocking)
     *
     * @param  array{email: string, token: string, password: string}  $credentials
     * @return string One of Password::PASSWORD_RESET or Password::INVALID_TOKEN or Password::INVALID_USER
     */
    public function resetPassword(array $credentials): string
    {
        $status = Password::reset(
            $credentials,
            function (User $user, string $password) {
                DB::transaction(function () use ($user, $password) {
                    $revokedCount = $this->tokenService->revokeAllSessions($user);

                    $user->password = $password; // hashed by cast
                    $user->password_changed_at = now();
                    $user->save();

                    $this->auditLogService->recordFromRequest(
                        action: AuditAction::UserPasswordResetSelfService,
                        subject: $user,
                        actor: $user,
                        metadata: [
                            'reset_source' => 'public_api',
                            'revoked_tokens_count' => $revokedCount,
                        ]
                    );
                });

                // Non-blocking security notification — if mail fails, reset still succeeds.
                try {
                    $user->notify(new PasswordChangedNotification);
                } catch (\Throwable) {
                    // Intentionally swallowed — mail is a best-effort security notification.
                }
            }
        );

        return $status;
    }
}
