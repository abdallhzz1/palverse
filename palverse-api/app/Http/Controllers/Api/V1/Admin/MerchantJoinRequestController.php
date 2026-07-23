<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Shared\UpdateMerchantJoinRequestStatusRequest;
use App\Models\MerchantJoinRequest;
use App\Services\MerchantJoinRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MerchantJoinRequestController extends Controller
{
    public function __construct(
        private readonly MerchantJoinRequestService $joinRequestService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = MerchantJoinRequest::with(['city'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $requests = $query->paginate();

        return response()->json([
            'data' => $requests->map(function ($req) {
                return [
                    'public_id' => $req->public_id,
                    'merchant_name' => $req->merchant_name,
                    'store_name' => $req->store_name,
                    'phone' => $req->phone,
                    'email' => $req->email,
                    'status' => $req->status,
                    'notes' => $req->notes,
                    'created_at' => $req->created_at,
                    'city' => $req->city ? [
                        'public_id' => $req->city->public_id,
                        'name_ar' => $req->city->name_ar,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $joinRequest = MerchantJoinRequest::where('public_id', $publicId)->with(['city'])->firstOrFail();

        return response()->json([
            'data' => [
                'public_id' => $joinRequest->public_id,
                'merchant_name' => $joinRequest->merchant_name,
                'store_name' => $joinRequest->store_name,
                'phone' => $joinRequest->phone,
                'email' => $joinRequest->email,
                'status' => $joinRequest->status,
                'notes' => $joinRequest->notes,
                'created_at' => $joinRequest->created_at,
                'city' => $joinRequest->city ? [
                    'public_id' => $joinRequest->city->public_id,
                    'name_ar' => $joinRequest->city->name_ar,
                ] : null,
            ],
        ]);
    }

    public function updateStatus(UpdateMerchantJoinRequestStatusRequest $request, string $publicId): JsonResponse
    {
        $joinRequest = MerchantJoinRequest::where('public_id', $publicId)->firstOrFail();

        $this->joinRequestService->updateStatus(
            $joinRequest,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
        ]);
    }
}
