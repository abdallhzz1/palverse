<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AuditLogIndexRequest;
use App\Http\Resources\Api\V1\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    /**
     * List audit logs with filtering and pagination.
     */
    public function index(AuditLogIndexRequest $request): JsonResponse
    {
        $query = AuditLog::query();

        if ($request->filled('action')) {
            $query->action($request->input('action'));
        }

        if ($request->filled('actor_public_id')) {
            $query->forActor($request->input('actor_public_id'));
        }

        if ($request->filled('subject_type') && $request->filled('subject_public_id')) {
            $query->forSubject($request->input('subject_type'), $request->input('subject_public_id'));
        } elseif ($request->filled('subject_type')) {
            $query->where('subject_type', $request->input('subject_type'));
        } elseif ($request->filled('subject_public_id')) {
            $query->where('subject_public_id', $request->input('subject_public_id'));
        }

        if ($request->filled('request_id')) {
            $query->where('request_id', $request->input('request_id'));
        }

        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->input('created_from'));
        }

        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->input('created_to'));
        }

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('actor_name', 'like', "%{$q}%")
                    ->orWhere('actor_email', 'like', "%{$q}%")
                    ->orWhere('subject_label', 'like', "%{$q}%")
                    ->orWhere('action', 'like', "%{$q}%")
                    ->orWhere('request_id', 'like', "%{$q}%");
            });
        }

        $sort = $request->input('sort', 'newest');
        $direction = $sort === 'oldest' ? 'asc' : 'desc';
        $query->orderBy('created_at', $direction);

        $perPage = $request->input('per_page', 15);
        $logs = $query->paginate($perPage);

        $resourceResponse = AuditLogResource::collection($logs)->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب سجلات التدقيق بنجاح.',
            'data' => $resourceResponse['data'] ?? [],
            'meta' => $resourceResponse['meta'] ?? [],
            'links' => $resourceResponse['links'] ?? [],
        ]);
    }

    /**
     * Show detailed audit log.
     */
    public function show(string $publicId): JsonResponse
    {
        $log = AuditLog::where('public_id', $publicId)->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب تفاصيل السجل بنجاح.',
            'data' => clone new AuditLogResource($log),
            'meta' => [],
        ]);
    }
}
