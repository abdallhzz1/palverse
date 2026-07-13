<?php

namespace App\Services;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class UserManagementService
{
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

            return $user;
        });
    }

    /**
     * Update safe user fields.
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
                $user->email_verified_at = null;
            }

            $user->update($data);

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
            $user->status = UserStatus::Suspended;
            $user->suspended_at = now();
            $user->suspended_by = $actor->id;
            $user->suspension_reason = $reason;
            $user->save();

            if ($revokeTokens) {
                $user->tokens()->delete();
            }

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

        return DB::transaction(function () use ($user, $actor, $revokeTokens) {
            $user->status = UserStatus::Inactive;
            $user->deactivated_at = now();
            $user->deactivated_by = $actor->id;

            // Note: we preserve historical suspension data explicitly, not clearing it.

            $user->save();

            if ($revokeTokens) {
                $user->tokens()->delete();
            }

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
            $user->status = UserStatus::Active;

            // Clear current blocking statuses
            $user->deactivated_at = null;
            $user->deactivated_by = null;
            $user->suspended_at = null;
            $user->suspended_by = null;
            $user->suspension_reason = null;

            $user->save();

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

            // If removing admin role
            if ($hasAdminCurrently && ! $willHaveAdmin) {
                if (! $user->canBeDisabledBy($actor)) {
                    throw new InvalidArgumentException('LAST_ADMIN_PROTECTION');
                }
            }

            $user->syncRoles($roles);

            return $user;
        });
    }

    /**
     * Revoke all access tokens for a user.
     */
    public function revokeTokens(User $user): int
    {
        return $user->tokens()->delete();
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
        });
    }
}
