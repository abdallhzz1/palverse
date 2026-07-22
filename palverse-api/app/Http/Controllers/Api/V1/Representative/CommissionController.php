<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Representative\CommissionRecordResource;
use App\Models\CommissionRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $commissions = CommissionRecord::where('representative_id', $request->user()->id)
            ->with(['request'])
            ->latest()
            ->paginate();

        return response()->json([
            'data' => CommissionRecordResource::collection($commissions)->response()->getData(true)
        ]);
    }
}
