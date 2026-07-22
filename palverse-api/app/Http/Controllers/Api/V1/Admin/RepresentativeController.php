<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Zone;
use App\Models\RepresentativeZoneAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RepresentativeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::role('representative')
            ->with(['representativeProfile', 'activeZoneAssignments.zone']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('query')) {
            $searchTerm = '%' . $request->query('query') . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm)
                  ->orWhere('phone', 'like', $searchTerm)
                  ->orWhereHas('representativeProfile', function ($profileQuery) use ($searchTerm) {
                      $profileQuery->where('employee_code', 'like', $searchTerm);
                  });
            });
        }

        $representatives = $query->latest()->paginate();

        return response()->json([
            'data' => $representatives->map(function ($rep) {
                return [
                    'public_id' => $rep->public_id,
                    'name' => $rep->name,
                    'email' => $rep->email,
                    'phone' => $rep->phone,
                    'status' => $rep->status->value,
                    'employee_code' => $rep->representativeProfile?->employee_code,
                    'profile_status' => $rep->representativeProfile?->status->value,
                    'active_zones' => $rep->activeZoneAssignments->map(fn($az) => [
                        'public_id' => $az->zone->public_id,
                        'name_ar' => $az->zone->name_ar,
                    ]),
                ];
            })
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $representative = User::role('representative')
            ->where('public_id', $publicId)
            ->with(['representativeProfile', 'activeZoneAssignments.zone'])
            ->firstOrFail();

        return response()->json([
            'data' => [
                'public_id' => $representative->public_id,
                'name' => $representative->name,
                'email' => $representative->email,
                'phone' => $representative->phone,
                'status' => $representative->status->value,
                'employee_code' => $representative->representativeProfile?->employee_code,
                'profile_status' => $representative->representativeProfile?->status->value,
                'active_zones' => $representative->activeZoneAssignments->map(fn($az) => [
                    'public_id' => $az->zone->public_id,
                    'name_ar' => $az->zone->name_ar,
                ]),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'employee_code' => 'required|string|max:50|unique:representative_profiles',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('representative');

        $user->representativeProfile()->create([
            'employee_code' => $validated['employee_code'],
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Representative created successfully']);
    }

    public function update(Request $request, string $publicId): JsonResponse
    {
        $representative = User::role('representative')->where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($representative->id)],
            'phone' => ['required', 'string', 'max:20', Rule::unique('users')->ignore($representative->id)],
            'employee_code' => ['required', 'string', 'max:50', Rule::unique('representative_profiles')->ignore($representative->representativeProfile?->id)],
        ]);

        $representative->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        if ($representative->representativeProfile) {
            $representative->representativeProfile->update([
                'employee_code' => $validated['employee_code'],
            ]);
        } else {
            $representative->representativeProfile()->create([
                'employee_code' => $validated['employee_code'],
                'status' => 'active',
            ]);
        }

        if ($request->filled('password')) {
            $representative->update(['password' => Hash::make($request->password)]);
        }

        return response()->json(['message' => 'Representative updated successfully']);
    }

    public function assignZones(Request $request, string $publicId): JsonResponse
    {
        $representative = User::role('representative')->where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'zone_public_ids' => 'required|array',
            'zone_public_ids.*' => 'string|exists:zones,public_id',
        ]);

        $zoneIds = Zone::whereIn('public_id', $validated['zone_public_ids'])->pluck('id');

        // Deactivate all current assignments that are not in the new list
        RepresentativeZoneAssignment::where('representative_id', $representative->id)
            ->whereNotIn('zone_id', $zoneIds)
            ->update(['is_active' => false]);

        // Activate or create assignments for the new list
        foreach ($zoneIds as $zoneId) {
            RepresentativeZoneAssignment::updateOrCreate(
                ['representative_id' => $representative->id, 'zone_id' => $zoneId],
                ['is_active' => true]
            );
        }

        return response()->json(['message' => 'Zones assigned successfully']);
    }
}
