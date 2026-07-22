<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Get real-time public statistics for the homepage.
     */
    public function index(): JsonResponse
    {
        // Cache for 1 hour to prevent DB load on the homepage
        $stats = Cache::remember('public_home_stats', 3600, function () {
            $visits = SystemSetting::where('key', 'total_visits')->value('value') ?? 1000000;
            $searches = SystemSetting::where('key', 'total_searches')->value('value') ?? 150000;

            return [
                'stores_count' => Store::where('status', 'active')->count() ?? Store::count(),
                'clients_count' => User::doesntHave('roles')->count() ?: User::count(),
                'cities_count' => City::count(),
                'searches_count' => (int) $searches,
                'visits_count' => (int) $visits,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
