<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

abstract class BaseNotification extends Notification
{
    use Queueable;

    protected NotificationType $type;

    protected string $titleAr;

    protected ?string $titleEn = null;

    protected string $messageAr;

    protected ?string $messageEn = null;

    protected string $entityType;

    protected string $entityPublicId;

    protected string $actionUrl;

    protected array $metadata = [];

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type->value,
            'title_ar' => $this->titleAr,
            'title_en' => $this->titleEn,
            'message_ar' => $this->messageAr,
            'message_en' => $this->messageEn,
            'entity_type' => $this->entityType,
            'entity_public_id' => $this->entityPublicId,
            'action_url' => $this->actionUrl,
            'metadata' => $this->metadata,
        ];
    }
}
