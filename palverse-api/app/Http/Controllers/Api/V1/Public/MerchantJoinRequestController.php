<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\MerchantJoinRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MerchantJoinRequestController extends Controller
{
    private \App\Services\NotificationService $notificationService;

    public function __construct(\App\Services\NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Store a newly created merchant join request in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'merchant_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'required|email|max:255',
            'store_name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,public_id',
            'notes' => 'nullable|string',
        ]);

        $city = \App\Models\City::where('public_id', $validated['city_id'])->firstOrFail();
        $validated['city_id'] = $city->id;

        $joinRequest = MerchantJoinRequest::create($validated);

        // Notify Admins and Follow-up
        $admins = \App\Models\User::role(['admin', 'follow_up'])->get();
        $notification = new \App\Notifications\NewJoinRequestNotification($joinRequest);
        
        foreach ($admins as $admin) {
            $this->notificationService->send($admin, clone $notification);
        }

        return response()->json([
            'message' => 'Join request submitted successfully',
            'data' => [
                'public_id' => $joinRequest->public_id,
            ],
        ], 201);
    }
}
