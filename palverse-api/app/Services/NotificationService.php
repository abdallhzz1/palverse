<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Send a notification to a user, optionally deduplicating by an event key.
     *
     * @param  User  $user  The user to notify
     * @param  Notification  $notification  The notification instance
     * @param  string|null  $eventKey  A unique key to prevent duplicate notifications (e.g. 'subscription_expired:uuid')
     * @return bool True if notification was sent, false if it was skipped due to deduplication
     */
    public function send(User $user, Notification $notification, ?string $eventKey = null): bool
    {
        if ($eventKey) {
            $exists = DB::table('notifications')
                ->where('notifiable_type', $user->getMorphClass())
                ->where('notifiable_id', $user->getKey())
                ->where('data->metadata->event_key', $eventKey)
                ->exists();

            if ($exists) {
                return false;
            }
        }

        $user->notify($notification);

        return true;
    }
}
