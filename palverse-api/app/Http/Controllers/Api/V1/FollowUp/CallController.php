<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\FollowUpCall;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CallController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', FollowUpCall::class);

        $calls = FollowUpCall::with(['followUpUser', 'merchantUser', 'store'])
            ->latest('contacted_at')
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $calls->items(),
            'meta' => [
                'current_page' => $calls->currentPage(),
                'last_page' => $calls->lastPage(),
                'per_page' => $calls->perPage(),
                'total' => $calls->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', FollowUpCall::class);

        $validated = $request->validate([
            'call_type' => ['required', 'string', 'in:registration_review,renewal,unpaid_subscription,merchant_satisfaction,representative_follow_up,complaint,general'],
            'outcome' => ['required', 'string', 'in:answered,no_answer,busy,wrong_number,callback_requested,resolved,needs_follow_up,declined,renewed,satisfied,dissatisfied'],
            'merchant_user_id' => ['nullable', 'exists:users,id'],
            'store_id' => ['nullable', 'exists:stores,id'],
            'subscription_id' => ['nullable', 'exists:store_subscriptions,id'],
            'representative_id' => ['nullable', 'exists:users,id'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'next_action_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'satisfaction_score' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $validated['public_id'] = (string) Str::ulid();
        $validated['follow_up_user_id'] = $request->user()->id;
        $validated['contacted_at'] = now();

        $call = FollowUpCall::create($validated);

        return response()->json([
            'success' => true,
            'data' => $call->load(['followUpUser', 'merchantUser', 'store']),
        ], 201);
    }

    public function show(string $publicId): JsonResponse
    {
        $call = FollowUpCall::where('public_id', $publicId)
            ->with(['followUpUser', 'merchantUser', 'store'])
            ->firstOrFail();

        $this->authorize('view', $call);

        return response()->json([
            'success' => true,
            'data' => $call,
        ]);
    }

    public function update(Request $request, string $publicId): JsonResponse
    {
        $call = FollowUpCall::where('public_id', $publicId)->firstOrFail();
        
        $this->authorize('update', $call);

        $validated = $request->validate([
            'outcome' => ['required', 'string', 'in:answered,no_answer,busy,wrong_number,callback_requested,resolved,needs_follow_up,declined,renewed,satisfied,dissatisfied'],
            'next_action_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'satisfaction_score' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $call->update($validated);

        return response()->json([
            'success' => true,
            'data' => $call->load(['followUpUser', 'merchantUser', 'store']),
        ]);
    }
}
