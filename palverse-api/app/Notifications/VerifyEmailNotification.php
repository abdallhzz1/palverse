<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $expireMinutes = Config::get('auth.verification.expire', 60);

        return (new MailMessage)
            ->subject('تأكيد البريد الإلكتروني – بالفيرس / Verify Email Address')
            ->greeting('مرحباً / Hello,')
            ->line('يرجى النقر على الزر أدناه لتأكيد عنوان بريدك الإلكتروني.')
            ->line('Please click the button below to verify your email address.')
            ->action('تأكيد البريد الإلكتروني / Verify Email Address', $verificationUrl)
            ->line("ينتهي هذا الرابط خلال {$expireMinutes} دقيقة.")
            ->line("This link will expire in {$expireMinutes} minutes.")
            ->line('إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد بأمان.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('فريق بالفيرس / The Palverse Team');
    }

    /**
     * Get the verification URL for the given notifiable.
     * We generate a backend signed URL, then pass it as a query parameter
     * to the configured frontend verification page.
     */
    protected function verificationUrl(object $notifiable): string
    {
        $backendSignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $baseUrl = rtrim((string) config('palverse.auth.frontend_verify_email_url', 'http://localhost:3000/verify-email'), '/');

        return $baseUrl.'?'.http_build_query([
            'verify_url' => $backendSignedUrl,
        ]);
    }
}
