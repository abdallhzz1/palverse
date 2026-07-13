<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $baseUrl = rtrim((string) config('palverse.auth.frontend_reset_password_url', 'http://localhost:3000/reset-password'), '/');

        $resetUrl = $baseUrl.'?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        $expireMinutes = config('auth.passwords.users.expire', 60);

        return (new MailMessage)
            ->subject('إعادة تعيين كلمة المرور – بالفيرس / Reset Your Palverse Password')
            ->greeting('مرحباً / Hello,')
            ->line('لقد تلقينا طلباً لإعادة تعيين كلمة مرور حسابك على منصة بالفيرس.')
            ->line('We received a request to reset the password for your Palverse account.')
            ->action('إعادة تعيين كلمة المرور / Reset Password', $resetUrl)
            ->line("ينتهي هذا الرابط خلال {$expireMinutes} دقيقة.")
            ->line("This link will expire in {$expireMinutes} minutes.")
            ->line('إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.')
            ->line('If you did not request a password reset, no further action is required.')
            ->salutation('فريق بالفيرس / The Palverse Team');
    }
}
