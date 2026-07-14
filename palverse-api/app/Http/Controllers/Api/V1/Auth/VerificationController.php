<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\AuditAction;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use App\Services\AuditLogService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Send or resend the email verification notification.
     */
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email is already verified.',
                'data' => null,
                'meta' => [],
            ]);
        }

        $user->notify(new VerifyEmailNotification);

        $this->auditLogService->recordFromRequest(
            action: AuditAction::UserEmailVerificationSent,
            actor: $user,
            subject: $user,
            metadata: []
        );

        return response()->json([
            'success' => true,
            'message' => 'Verification link sent.',
            'data' => null,
            'meta' => [],
        ]);
    }

    /**
     * Verify the email address using the signed URL parameters.
     */
    public function verify(Request $request, string $id, string $hash): JsonResponse
    {
        // Must validate user exists and is not deleted
        $user = User::withTrashed()->find($id);

        if (! $user || $user->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link.',
                'error' => ['code' => 'EMAIL_VERIFICATION_LINK_INVALID', 'details' => []],
                'meta' => [],
            ], 400);
        }

        // Validate hash
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link.',
                'error' => ['code' => 'EMAIL_VERIFICATION_LINK_INVALID', 'details' => []],
                'meta' => [],
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Email is already verified.',
                'data' => null,
                'meta' => [],
            ]);
        }

        $user->markEmailAsVerified();

        // Dispatch Laravel's Verified event
        event(new Verified($user));

        $this->auditLogService->recordFromRequest(
            action: AuditAction::UserEmailVerified,
            actor: $user,
            subject: $user,
            metadata: []
        );

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully.',
            'data' => null,
            'meta' => [],
        ]);
    }

    /**
     * Get the current user's email verification status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Verification status retrieved.',
            'data' => [
                'email' => $user->email,
                'is_verified' => $user->hasVerifiedEmail(),
                'email_verified_at' => $user->email_verified_at,
                'verification_required' => true,
                'can_resend' => ! $user->hasVerifiedEmail(),
            ],
            'meta' => [],
        ]);
    }
}
