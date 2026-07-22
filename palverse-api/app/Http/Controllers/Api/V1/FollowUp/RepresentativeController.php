<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepresentativeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('representatives.view') && !$request->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $representatives = User::role('representative')
            ->with(['representativeZoneAssignments'])
            ->withCount(['storeRegistrationRequests', 'followUpCalls'])
            ->latest()
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $representatives->items(),
            'meta' => [
                'current_page' => $representatives->currentPage(),
                'last_page' => $representatives->lastPage(),
                'per_page' => $representatives->perPage(),
                'total' => $representatives->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo('representatives.manage') && !$request->user()->hasRole('admin') && !$request->user()->hasRole('follow_up')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:30|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        $user->assignRole('representative');

        \App\Models\RepresentativeProfile::create([
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Representative created successfully',
            'data' => [
                'public_id' => $user->public_id,
            ],
        ], 201);
    }

    public function show(string $publicId): JsonResponse
    {
        $representative = User::role('representative')
            ->where('public_id', $publicId)
            ->with(['representativeZoneAssignments'])
            ->withCount([
                'storeRegistrationRequests as submitted_requests_count' => function ($query) {
                    $query->where('status', 'submitted');
                },
                'storeRegistrationRequests as approved_requests_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'storeRegistrationRequests as rejected_requests_count' => function ($query) {
                    $query->where('status', 'rejected');
                },
                'storeRegistrationRequests as needs_changes_requests_count' => function ($query) {
                    $query->where('status', 'needs_changes');
                },
                'refusalReports',
                'followUpCalls',
            ])
            ->firstOrFail();

        if (!request()->user()->hasPermissionTo('representatives.view') && !request()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'success' => true,
            'data' => $representative,
        ]);
    }
}
