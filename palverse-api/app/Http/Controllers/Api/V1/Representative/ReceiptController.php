<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Representative\CreateCollectionReceiptRequest;
use App\Http\Resources\Api\V1\Representative\CollectionReceiptResource;
use App\Models\CollectionReceipt;
use App\Models\Store;
use App\Models\StoreRegistrationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReceiptController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $receipts = CollectionReceipt::where('representative_id', $request->user()->id)
            ->with(['store', 'request'])
            ->latest()
            ->paginate();

        return response()->json([
            'data' => CollectionReceiptResource::collection($receipts)->response()->getData(true)
        ]);
    }

    public function store(CreateCollectionReceiptRequest $request): JsonResponse
    {
        $storeId = null;
        $requestId = null;

        if ($request->validated('store_public_id')) {
            $storeId = Store::where('public_id', $request->validated('store_public_id'))->firstOrFail()->id;
        }

        if ($request->validated('store_registration_request_public_id')) {
            $storeRequest = StoreRegistrationRequest::where(
                'public_id',
                $request->validated('store_registration_request_public_id')
            )->firstOrFail();

            if ($storeRequest->representative_id !== $request->user()->id) {
                abort(403, 'ليس لديك صلاحية إنشاء سند لهذا الطلب.');
            }

            $requestId = $storeRequest->id;
        }

        // Generate a random receipt number (in a real app, this might come from a physical receipt book)
        $receiptNumber = 'REC-' . strtoupper(Str::random(8));

        $receipt = CollectionReceipt::create([
            'representative_id' => $request->user()->id,
            'store_id' => $storeId,
            'store_registration_request_id' => $requestId,
            'receipt_number' => $receiptNumber,
            'issued_by' => $request->user()->id,
            'amount' => $request->validated('amount'),
            'currency' => $request->validated('currency'),
            'payment_purpose' => $request->validated('payment_purpose'),
            'collected_at' => $request->validated('collected_at'),
            'notes' => $request->validated('notes'),
        ]);

        $receipt->refresh();

        return response()->json([
            'data' => new CollectionReceiptResource($receipt->load(['store', 'request']))
        ], 201);
    }
}
