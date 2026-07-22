<?php

use App\Exceptions\BusinessException;
use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\SetSecurityHeaders;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Run security headers on every response (including router-level errors)
        $middleware->prepend(SetSecurityHeaders::class);

        // Correlation ID is only meaningful for API clients
        $middleware->api(prepend: [
            AssignRequestId::class,
        ]);

        $middleware->api(append: [
            'throttle:api',
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'verified.api' => EnsureEmailIsVerified::class,
            'user.active' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Only render JSON for API routes
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // ── BusinessException (domain-level rule violation) ─────────────────
        $exceptions->render(function (BusinessException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => [
                    'code' => $e->getErrorCode(),
                    'details' => $e->getDetails(),
                ],
            ], $e->getHttpStatus());
        });

        // ── ValidationException (HTTP 422) ───────────────────────────────────
        $exceptions->render(function (ValidationException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $validationErrors = $e->errors();

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'Invalid inputs provided.'
                    : 'بيانات المدخلات غير صالحة.',
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'details' => $validationErrors,
                ],
                'errors' => $validationErrors,
            ], 422);
        });

        // ── AuthenticationException (HTTP 401) ───────────────────────────────
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

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
        });

        // ── AuthorizationException (HTTP 403) ────────────────────────────────
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'You are not authorized to perform this action.'
                    : 'ليس لديك الصلاحية الكافية لإجراء هذه العملية.',
                'error' => [
                    'code' => 'UNAUTHORIZED_ACTION',
                    'details' => [],
                ],
            ], 403);
        });

        // ── ModelNotFoundException / NotFoundHttpException (HTTP 404) ─────────
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'The requested resource was not found.'
                    : 'المصدر المطلوب غير موجود.',
                'error' => [
                    'code' => 'RESOURCE_NOT_FOUND',
                    'details' => [],
                ],
            ], 404);
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'The requested resource was not found.'
                    : 'المصدر المطلوب غير موجود.',
                'error' => [
                    'code' => 'RESOURCE_NOT_FOUND',
                    'details' => [],
                ],
            ], 404);
        });

        // ── MethodNotAllowedHttpException (HTTP 405) ─────────────────────────
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'HTTP method not allowed.'
                    : 'طريقة HTTP غير مسموح بها.',
                'error' => [
                    'code' => 'METHOD_NOT_ALLOWED',
                    'details' => [],
                ],
            ], 405);
        });

        // ── InvalidSignatureException (HTTP 403) ─────────────────────────────
        $exceptions->render(function (InvalidSignatureException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'This link is invalid or has expired.'
                    : 'الرابط غير صالح أو منتهي الصلاحية.',
                'error' => [
                    'code' => 'INVALID_SIGNATURE',
                    'details' => [],
                ],
            ], 403);
        });

        // ── TooManyRequestsHttpException (HTTP 429) ───────────────────────────
        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $retryAfter = $e->getHeaders()['Retry-After'] ?? null;

            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en'
                    ? 'Too many requests. Please try again later.'
                    : 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً.',
                'error' => [
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'details' => $retryAfter ? ['retry_after_seconds' => (int) $retryAfter] : [],
                ],
            ], 429);
        });

        // ── Generic HttpException fallback ────────────────────────────────────
        $exceptions->render(function (HttpException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = $e->getStatusCode();

            // 500-level: do not leak exception details
            if ($status >= 500) {
                $correlationId = $request->attributes->get('request_id', null);

                return response()->json([
                    'success' => false,
                    'message' => app()->getLocale() === 'en'
                        ? 'An internal server error occurred.'
                        : 'حدث خطأ داخلي في الخادم.',
                    'error' => [
                        'code' => 'INTERNAL_SERVER_ERROR',
                        'details' => $correlationId ? ['correlation_id' => $correlationId] : [],
                    ],
                ], 500);
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'An error occurred.',
                'error' => [
                    'code' => 'HTTP_ERROR',
                    'details' => [],
                ],
            ], $status);
        });
    })->create();
