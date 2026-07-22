<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommissionRecord::with(['representative', 'store', 'request']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('representative_id')) {
            // Find representative by public_id
            $rep = \App\Models\User::where('public_id', $request->query('representative_id'))->first();
            if ($rep) {
                $query->where('representative_id', $rep->id);
            }
        }

        $commissions = $query->latest()->paginate();

        return response()->json([
            'data' => $commissions->map(function ($comm) {
                return [
                    'public_id' => $comm->public_id,
                    'amount' => $comm->amount,
                    'type' => $comm->reason, // maps to frontend 'type'
                    'status' => $comm->status,
                    'notes' => $comm->notes,
                    'created_at' => $comm->created_at,
                    'paid_at' => $comm->paid_at,
                    'representative' => $comm->representative ? [
                        'public_id' => $comm->representative->public_id,
                        'name' => $comm->representative->name,
                    ] : null,
                    'store' => $comm->store ? [
                        'public_id' => $comm->store->public_id,
                        'name_ar' => $comm->store->name_ar,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $commissions->currentPage(),
                'last_page' => $commissions->lastPage(),
                'total' => $commissions->total(),
            ],
        ]);
    }

    public function markAsPaid(string $publicId): JsonResponse
    {
        $commission = CommissionRecord::where('public_id', $publicId)->firstOrFail();

        if ($commission->status === 'paid') {
            return response()->json(['message' => 'Commission is already paid'], 400);
        }

        $commission->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json(['message' => 'Commission marked as paid']);
    }
}
