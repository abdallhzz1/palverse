<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

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

    /**
     * Display a listing of the merchant join requests.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $requests = MerchantJoinRequest::with(['city', 'handler'])
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $formatted = $requests->map(function ($req) {
            return [
                'public_id' => $req->public_id,
                'merchant_name' => $req->merchant_name,
                'store_name' => $req->store_name,
                'phone' => $req->phone,
                'email' => $req->email,
                'status' => $req->status,
                'status_label' => $req->status->labelAr(),
                'city' => $req->city ? ['id' => $req->city->id, 'name_ar' => $req->city->name_ar] : null,
                'created_at' => $req->created_at?->toIso8601String(),
                'handler' => $req->handler ? ['id' => $req->handler->id, 'name' => $req->handler->name] : null,
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $publicId): JsonResponse
    {
        $req = MerchantJoinRequest::with(['city', 'handler'])->where('public_id', $publicId)->firstOrFail();

        return response()->json([
            'data' => [
                'public_id' => $req->public_id,
                'merchant_name' => $req->merchant_name,
                'store_name' => $req->store_name,
                'phone' => $req->phone,
                'email' => $req->email,
                'notes' => $req->notes,
                'status' => $req->status,
                'status_label' => $req->status->labelAr(),
                'city' => $req->city ? ['id' => $req->city->id, 'name_ar' => $req->city->name_ar] : null,
                'created_at' => $req->created_at?->toIso8601String(),
                'handler' => $req->handler ? ['id' => $req->handler->id, 'name' => $req->handler->name] : null,
            ],
        ]);
    }

    /**
     * Update the status of the specified resource.
     */
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
