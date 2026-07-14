<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            $email = mb_strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by(
                $email.'|'.$request->ip()
            );
        });

        RateLimiter::for('merchant-registration', function (Request $request): Limit {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many registration attempts. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });

        RateLimiter::for('forgot-password', function (Request $request): Limit {
            return Limit::perMinute(5)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });

        RateLimiter::for('password-reset', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });

        RateLimiter::for('verification-notification', function (Request $request): Limit {
            return Limit::perMinute(3)->by($request->user()?->id ?: $request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });

        RateLimiter::for('email-verification', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });

        RateLimiter::for('sessions-revoke', function (Request $request): Limit {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip())->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'error' => ['code' => 'TOO_MANY_REQUESTS', 'details' => []],
                    'meta' => [],
                ], 429);
            });
        });
    }
}
