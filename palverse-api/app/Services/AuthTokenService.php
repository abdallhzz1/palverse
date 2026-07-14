<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\NewAccessToken;
use Laravel\Sanctum\PersonalAccessToken;

class AuthTokenService
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Issue a new Sanctum token for the given user, attaching session metadata.
     */
    public function createToken(User $user, Request $request, ?string $deviceName = null, ?string $deviceType = null): NewAccessToken
    {
        $resolvedDeviceName = trim($deviceName ?: 'palverse-client');
        $resolvedDeviceType = $deviceType ? mb_strtolower(trim($deviceType)) : 'unknown';

        $token = $user->createToken($resolvedDeviceName);

        // Update session metadata
        $publicId = (string) Str::ulid();

        $token->accessToken->forceFill([
            'public_id' => $publicId,
            'device_name' => $resolvedDeviceName,
            'device_type' => $resolvedDeviceType,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit($request->userAgent(), 500),
        ])->save();

        // Audit the creation (do not log the token value)
        $this->auditLogService->recordFromRequest(
            action: AuditAction::SessionCreated,
            actor: $user,
            subject: $token->accessToken,
            metadata: [
                'session_public_id' => $publicId,
                'device_name' => $resolvedDeviceName,
                'device_type' => $resolvedDeviceType,
                'ip_address' => $request->ip(),
            ]
        );

        return $token;
    }

    /**
     * Revoke a specific token by its public_id for a given user.
     */
    public function revokeSession(User $user, ?string $publicId): bool
    {
        if (! $publicId) {
            return false;
        }

        $token = $user->tokens()->where('public_id', $publicId)->first();

        if (! $token) {
            return false;
        }

        $token->delete();

        $this->auditLogService->recordFromRequest(
            action: AuditAction::SessionRevoked,
            actor: $user,
            subject: $user,
            metadata: [
                'revoked_session_public_id' => $publicId,
                'device_name' => $token->device_name,
            ]
        );

        return true;
    }

    /**
     * Revoke all tokens for a given user.
     */
    public function revokeAllSessions(User $user): int
    {
        $count = $user->tokens()->count();

        if ($count > 0) {
            $user->tokens()->delete();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::SessionRevokedAll,
                actor: $user,
                subject: $user,
                metadata: [
                    'revoked_count' => $count,
                ]
            );
        }

        return $count;
    }

    /**
     * Revoke all tokens EXCEPT the current one.
     */
    public function revokeOtherSessions(User $user, PersonalAccessToken $currentToken): int
    {
        $query = $user->tokens()->where('id', '!=', $currentToken->id);
        $count = $query->count();

        if ($count > 0) {
            $query->delete();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::SessionRevokedOthers,
                actor: $user,
                subject: $user,
                metadata: [
                    'revoked_count' => $count,
                    'kept_session_public_id' => $currentToken->public_id,
                ]
            );
        }

        return $count;
    }

    /**
     * Format a session for API response, determining if it is the current one.
     */
    public function formatSession(PersonalAccessToken $token, ?PersonalAccessToken $currentToken = null): array
    {
        return [
            'public_id' => $token->public_id,
            'device_name' => $token->device_name,
            'device_type' => $token->device_type,
            'ip_address' => $token->ip_address,
            'user_agent' => $token->user_agent,
            'is_current' => $currentToken && $token->id === $currentToken->id,
            'last_used_at' => $token->last_used_at,
            'created_at' => $token->created_at,
            'expires_at' => $token->expires_at,
        ];
    }
}
