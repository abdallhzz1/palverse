<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Representative\CollectionReceiptResource;
use App\Models\CollectionReceipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CollectionReceipt::with(['store', 'request', 'representative', 'issuedBy', 'settledBy']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $receipts = $query->latest()->paginate();

        return response()->json([
            'data' => CollectionReceiptResource::collection($receipts)->response()->getData(true)
        ]);
    }

    public function settle(Request $request, string $publicId): JsonResponse
    {
        $this->authorize('settle', CollectionReceipt::class);

        $receipt = CollectionReceipt::where('public_id', $publicId)->firstOrFail();

        if ($receipt->status->value === 'settled') {
            return response()->json(['message' => 'السند مورد مسبقاً'], 400);
        }

        $receipt->update([
            'status' => 'settled',
            'settled_at' => now(),
            'settled_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'تم تأكيد التوريد بنجاح',
            'data' => new CollectionReceiptResource($receipt->load(['store', 'request', 'representative', 'issuedBy', 'settledBy']))
        ]);
    }
}
