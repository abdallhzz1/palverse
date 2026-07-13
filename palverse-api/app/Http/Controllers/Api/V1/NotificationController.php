<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\NotificationIndexRequest;
use App\Http\Resources\Api\V1\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(NotificationIndexRequest $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->notifications();

        if ($request->has('unread')) {
            if ($request->boolean('unread')) {
                $query->whereNull('read_at');
            } else {
                $query->whereNotNull('read_at');
            }
        }

        if ($request->filled('type')) {
            $query->where('data->type', $request->input('type'));
        }

        $direction = $request->input('direction', 'desc');
        // By default, $user->notifications() orders by created_at desc
        if ($request->input('sort') === 'created_at' || ! $request->has('sort')) {
            // Remove previous order bindings if we need to set direction explicitly
            $query->getQuery()->orders = null;
            $query->orderBy('created_at', $direction);
        }

        $perPage = $request->input('per_page', config('palverse.notifications.per_page', 20));
        $notifications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => __('Notifications retrieved successfully.'),
            'data' => NotificationResource::collection($notifications)->response()->getData(true)['data'],
            'meta' => NotificationResource::collection($notifications)->response()->getData(true)['meta'] ?? [],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'message' => __('Unread notifications count retrieved successfully.'),
            'data' => [
                'unread_count' => $count,
            ],
            'meta' => [],
        ]);
    }

    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found.',
                'error' => [
                    'code' => 'NOTIFICATION_NOT_FOUND',
                ],
                'meta' => [],
            ], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => __('Notification marked as read successfully.'),
            'data' => clone new NotificationResource($notification),
            'meta' => [],
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $unreadCount = $user->unreadNotifications()->count();
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => __('All notifications marked as read successfully.'),
            'data' => [
                'marked_count' => $unreadCount,
            ],
            'meta' => [],
        ]);
    }
}
