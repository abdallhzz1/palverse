<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class UserManagementService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Create a new merchant user.
     */
    public function createMerchant(array $data, User $actor): User
    {
        return DB::transaction(function () use ($data, $actor) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'preferred_locale' => $data['preferred_locale'] ?? 'ar',
                'password' => $data['password'], // Hash cast will handle hashing
                'status' => UserStatus::Active,
            ]);

            $user->created_by = $actor->id;
            $user->password_changed_at = now();
            $user->save();

            $user->assignRole('merchant');

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserCreated,
                subject: $user,
                oldValues: [],
                newValues: $user->only(['name', 'email', 'phone', 'preferred_locale', 'status', 'public_id']),
                actor: $actor
            );

            return $user;
        });
    }

    /**
     * Update safe user fields.
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $oldValues = $user->only(array_keys($data));

            if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
                $user->email_verified_at = null;
            }

            $user->update($data);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserUpdated,
                subject: $user,
                oldValues: $oldValues,
                newValues: $data
            );

            return $user;
        });
    }

    /**
     * Suspend a user.
     */
    public function suspendUser(User $user, User $actor, string $reason, bool $revokeTokens = true): User
    {
        if (! $user->canBeDisabledBy($actor)) {
            throw new InvalidArgumentException('USER_SELF_DISABLE_NOT_ALLOWED');
        }

        if ($user->status === UserStatus::Suspended) {
            throw new InvalidArgumentException('USER_ALREADY_SUSPENDED');
        }

        return DB::transaction(function () use ($user, $actor, $reason, $revokeTokens) {
            $oldStatus = $user->status;

            $user->status = UserStatus::Suspended;
            $user->suspended_at = now();
            $user->suspended_by = $actor->id;
            $user->suspension_reason = $reason;
            $user->save();

            if ($revokeTokens) {
                $user->tokens()->delete();
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserSuspended,
                subject: $user,
                oldValues: ['status' => $oldStatus->value],
                newValues: ['status' => $user->status->value, 'suspension_reason' => $reason],
                metadata: ['tokens_revoked' => $revokeTokens],
                actor: $actor
            );

            return $user;
        });
    }

    /**
     * Deactivate a user.
     */
    public function deactivateUser(User $user, User $actor, ?string $reason = null, bool $revokeTokens = true): User
    {
        if (! $user->canBeDisabledBy($actor)) {
            throw new InvalidArgumentException('USER_SELF_DISABLE_NOT_ALLOWED');
        }

        if ($user->status === UserStatus::Inactive) {
            throw new InvalidArgumentException('USER_ALREADY_INACTIVE');
        }

        return DB::transaction(function () use ($user, $actor, $revokeTokens, $reason) {
            $oldStatus = $user->status;

            $user->status = UserStatus::Inactive;
            $user->deactivated_at = now();
            $user->deactivated_by = $actor->id;

            $user->save();

            if ($revokeTokens) {
                $user->tokens()->delete();
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserDeactivated,
                subject: $user,
                oldValues: ['status' => $oldStatus->value],
                newValues: ['status' => $user->status->value, 'reason' => $reason],
                metadata: ['tokens_revoked' => $revokeTokens],
                actor: $actor
            );

            return $user;
        });
    }

    /**
     * Activate a user.
     */
    public function activateUser(User $user): User
    {
        if ($user->status === UserStatus::Active) {
            throw new InvalidArgumentException('USER_ALREADY_ACTIVE');
        }

        return DB::transaction(function () use ($user) {
            $oldStatus = $user->status;

            $user->status = UserStatus::Active;
            $user->deactivated_at = null;
            $user->deactivated_by = null;
            $user->suspended_at = null;
            $user->suspended_by = null;
            $user->suspension_reason = null;

            $user->save();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserActivated,
                subject: $user,
                oldValues: ['status' => $oldStatus->value],
                newValues: ['status' => UserStatus::Active->value]
            );

            return $user;
        });
    }

    /**
     * Update user roles.
     */
    public function updateRoles(User $user, array $roles, User $actor): User
    {
        return DB::transaction(function () use ($user, $roles, $actor) {
            $hasAdminCurrently = $user->hasRole('admin');
            $willHaveAdmin = in_array('admin', $roles, true);

            if ($hasAdminCurrently && ! $willHaveAdmin) {
                if (! $user->canBeDisabledBy($actor)) {
                    throw new InvalidArgumentException('LAST_ADMIN_PROTECTION');
                }
            }

            $oldRoles = $user->roles->pluck('name')->toArray();

            $user->syncRoles($roles);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserRolesUpdated,
                subject: $user,
                oldValues: ['roles' => $oldRoles],
                newValues: ['roles' => $roles],
                actor: $actor
            );

            return $user;
        });
    }

    /**
     * Revoke all access tokens for a user.
     */
    public function revokeTokens(User $user): int
    {
        $count = $user->tokens()->delete();

        $this->auditLogService->recordFromRequest(
            action: AuditAction::UserTokensRevoked,
            subject: $user,
            metadata: ['revoked_count' => $count]
        );

        return $count;
    }

    /**
     * Reset user password safely.
     */
    public function resetPassword(User $user, string $password, bool $revokeTokens = true): void
    {
        DB::transaction(function () use ($user, $password, $revokeTokens) {
            $user->password = $password; // Hash cast will handle this
            $user->password_changed_at = now();
            $user->save();

            if ($revokeTokens) {
                $user->tokens()->delete();
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::UserPasswordReset,
                subject: $user,
                metadata: ['tokens_revoked' => $revokeTokens] // no password logged!
            );
        });
    }
}
