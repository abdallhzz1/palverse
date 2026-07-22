<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SystemController extends Controller
{
    /**
     * Liveness check (lightweight)
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'System is healthy.',
            'data' => [
                'status' => 'healthy',
                'timestamp' => now()->toIso8601String(),
                'version' => env('PALVERSE_API_VERSION', '1.0.0'),
            ],
            'meta' => [],
        ]);
    }

    /**
     * Readiness check (checks dependencies)
     */
    public function ready(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
        ];

        $isReady = ! in_array(false, $checks, true);

        if (! $isReady) {
            return response()->json([
                'success' => false,
                'message' => 'System is not ready.',
                'error' => [
                    'code' => 'SERVICE_UNAVAILABLE',
                    'details' => $checks,
                ],
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'System is ready.',
            'data' => [
                'status' => 'ready',
                'checks' => $checks,
                'timestamp' => now()->toIso8601String(),
                'version' => env('PALVERSE_API_VERSION', '1.0.0'),
            ],
            'meta' => [],
        ]);
    }

    /**
     * One-shot demo seed for Railway/Vercel bootstrapping.
     * Requires BOOTSTRAP_SEED_TOKEN and PALVERSE_ALLOW_DEMO_SEEDING=true.
     * Remove BOOTSTRAP_SEED_TOKEN from env after a successful run.
     */
    public function seedDemo(Request $request): JsonResponse
    {
        $expected = (string) config('palverse.demo.bootstrap_token', env('BOOTSTRAP_SEED_TOKEN', ''));
        $provided = (string) ($request->header('X-Bootstrap-Token') ?? $request->query('token', ''));

        if ($expected === '' || ! hash_equals($expected, $provided)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
                'error' => ['code' => 'FORBIDDEN', 'details' => []],
            ], 403);
        }

        if (! config('palverse.demo.allow_seeding', false) && ! filter_var(env('PALVERSE_ALLOW_DEMO_SEEDING', false), FILTER_VALIDATE_BOOLEAN)) {
            // Allow when token is present: force-enable for this request only.
            config(['palverse.demo.allow_seeding' => true]);
        }

        config(['palverse.demo.allow_seeding' => true]);

        Artisan::call('palverse:seed-demo', ['--force' => true]);
        $output = trim(Artisan::output());

        return response()->json([
            'success' => true,
            'message' => 'Demo seed completed.',
            'data' => [
                'output' => $output,
                'admin_email' => 'admin@palverse.demo',
                'hint' => 'Login with DemoAdmin123! then delete BOOTSTRAP_SEED_TOKEN from Railway Variables.',
            ],
            'meta' => [],
        ]);
    }

    protected function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable $e) {
            return false;
        }
    }

    protected function checkCache(): bool
    {
        try {
            $key = 'palverse.health_check';
            Cache::put($key, 'ok', 10);

            return Cache::get($key) === 'ok';
        } catch (Throwable $e) {
            return false;
        }
    }

    protected function checkStorage(): bool
    {
        try {
            // Only check if the disk is resolvable and accessible, don't write
            $disk = config('filesystems.default');
            // Check if the disk directory exists or can be resolved
            Storage::disk($disk)->exists('/');

            return true;
        } catch (Throwable $e) {
            return false;
        }
    }
}
