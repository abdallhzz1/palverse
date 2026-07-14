<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->queue = 'mail';
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $changedAt = now()->format('Y-m-d H:i:s T');

        return (new MailMessage)
            ->subject('تغيير كلمة المرور – بالفيرس / Palverse Password Changed')
            ->greeting('مرحباً / Hello,')
            ->line("تم تغيير كلمة مرور حسابك على بالفيرس بتاريخ: {$changedAt}")
            ->line("Your Palverse account password was changed on: {$changedAt}")
            ->line('إذا لم تقم بهذا الإجراء، يرجى التواصل مع الدعم الفني فوراً.')
            ->line('If you did not perform this action, please contact support immediately.')
            ->salutation('فريق بالفيرس / The Palverse Team');
    }
}
