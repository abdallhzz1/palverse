<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Representative\RejectionReportResource;
use App\Models\RepresentativeRejectionReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RejectionReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reports = RepresentativeRejectionReport::with(['zone', 'representative'])
            ->latest()
            ->paginate();

        return response()->json([
            'data' => RejectionReportResource::collection($reports)->response()->getData(true)
        ]);
    }
}
