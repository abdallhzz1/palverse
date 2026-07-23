<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Representative\CreateRejectionReportRequest;
use App\Http\Resources\Api\V1\Representative\RejectionReportResource;
use App\Models\RepresentativeRejectionReport;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RejectionReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reports = RepresentativeRejectionReport::where('representative_id', $request->user()->id)
            ->with(['zone'])
            ->latest()
            ->paginate();

        $paginated = RejectionReportResource::collection($reports)->response()->getData(true);

        return response()->json([
            'success' => true,
            'data' => $paginated['data'],
            'meta' => $paginated['meta'],
            'links' => $paginated['links'] ?? null,
        ]);
    }

    public function store(CreateRejectionReportRequest $request): JsonResponse
    {
        $zone = Zone::where('public_id', $request->validated('zone_public_id'))->firstOrFail();

        $data = collect($request->validated())->except('zone_public_id')->all();

        $report = RepresentativeRejectionReport::create(array_merge($data, [
            'representative_id' => $request->user()->id,
            'zone_id' => $zone->id,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء تقرير الرفض بنجاح.',
            'data' => new RejectionReportResource($report->load(['zone'])),
            'meta' => [],
        ], 201);
    }
}
