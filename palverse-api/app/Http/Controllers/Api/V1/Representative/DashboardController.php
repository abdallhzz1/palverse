<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Services\RepresentativeDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private RepresentativeDashboardService $dashboardService)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $rep = $request->user();

        return response()->json([
            'data' => [
                'summary' => $this->dashboardService->getSummary($rep),
                'activity' => $this->dashboardService->getRecentActivity($rep),
            ]
        ]);
    }
}
