<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts access to routes that require a verified email address.
 *
 * Unauthenticated requests are rejected with 401 UNAUTHENTICATED.
 * Authenticated but unverified users receive 403 EMAIL_NOT_VERIFIED.
 * Both responses conform to the standard API error envelope.
 */
class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'Unauthenticated. Please login to access this resource.'
                    : 'يجب تسجيل الدخول أولاً للوصول إلى هذا المصدر.',
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'details' => [],
                ],
            ], 401);
        }

        if (! $request->user()->hasVerifiedEmail()) {

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'Your email address has not been verified. Please check your inbox.'
                    : 'لم يتم التحقق من بريدك الإلكتروني بعد. يرجى التحقق من صندوق البريد.',
                'error' => [
                    'code' => 'EMAIL_NOT_VERIFIED',
                    'details' => [],
                ],
            ], 403);
        }

        return $next($request);
    }
}
