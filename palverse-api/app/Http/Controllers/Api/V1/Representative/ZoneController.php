<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Representative\RepresentativeZoneResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $assignments = $request->user()->activeZoneAssignments()
            ->with(['zone.city'])
            ->get();

        return response()->json([
            'data' => RepresentativeZoneResource::collection($assignments)
        ]);
    }
}
