<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    protected array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'access_token',
        'refresh_token',
        'remember_token',
        'api_key',
        'api_secret',
        'secret',
        'authorization',
        'private_key',
        'reset_token',
    ];

    /**
     * Record an audit event.
     */
    public function record(
        AuditAction|string $action,
        mixed $subject = null,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = [],
        mixed $actor = null,
        ?Request $request = null
    ): ?AuditLog {
        try {
            $log = new AuditLog;

            if ($action instanceof AuditAction) {
                $log->action = $action->value;
            } else {
                $log->action = $action;
            }

            $this->attachActor($log, $actor);
            $this->attachSubject($log, $subject);

            $log->old_values = $this->sanitize($oldValues);
            $log->new_values = $this->sanitize($newValues);
            $log->metadata = $this->sanitize($metadata);

            $this->attachRequestMetadata($log, $request);

            $log->save();

            return $log;
        } catch (\Exception $e) {
            // According to MVP requirements: audit write failure should cause sensitive administrative mutation to fail
            // We just let it bubble up if in a transaction, which triggers standard HTTP 500
            throw $e;
        }
    }

    /**
     * Helper to grab current request automatically.
     */
    public function recordFromRequest(
        AuditAction|string $action,
        mixed $subject = null,
        array $oldValues = [],
        array $newValues = [],
        array $metadata = [],
        mixed $actor = null
    ): ?AuditLog {
        return $this->record($action, $subject, $oldValues, $newValues, $metadata, $actor, request());
    }

    protected function attachActor(AuditLog $log, mixed $actor): void
    {
        if ($actor === 'system') {
            $log->actor_type = 'system';
            $log->actor_name = 'System';

            return;
        }

        // If not explicitly provided, try to get from auth
        if (! $actor && auth()->check()) {
            $actor = auth()->user();
        }

        if ($actor && method_exists($actor, 'getMorphClass')) {
            $log->actor_type = $actor->getMorphClass();
            $log->actor_id = $actor->id;
            $log->actor_public_id = $actor->public_id ?? null;
            $log->actor_name = $actor->name ?? null;
            $log->actor_email = $actor->email ?? null;
        }
    }

    protected function attachSubject(AuditLog $log, mixed $subject): void
    {
        if (! $subject) {
            return;
        }

        if (method_exists($subject, 'getMorphClass')) {
            $log->subject_type = $subject->getMorphClass();
            $log->subject_id = $subject->id ?? null;
            $log->subject_public_id = $subject->public_id ?? null;

            // Simple heuristic for label
            $log->subject_label = $subject->name
                ?? $subject->title_ar
                ?? $subject->email
                ?? $subject->slug
                ?? $subject->question
                ?? null;
        }
    }

    protected function attachRequestMetadata(AuditLog $log, ?Request $request): void
    {
        if (! $request) {
            return;
        }

        $log->route = $request->route() ? $request->route()->getName() : $request->path();
        $log->method = $request->method();
        $log->ip_address = $request->ip();
        $log->user_agent = $request->userAgent();
        $log->request_id = $request->attributes->get('request_id');
    }

    /**
     * Recursively sanitize sensitive keys and normalize non-JSON-safe values.
     */
    public function sanitize(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($key) && $this->isSensitiveKey($key)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitize($value);
            } elseif ($value instanceof \BackedEnum) {
                $data[$key] = $value->value;
            } elseif ($value instanceof \UnitEnum) {
                $data[$key] = $value->name;
            } elseif ($value instanceof \DateTimeInterface) {
                $data[$key] = $value->format(\DateTimeInterface::ISO8601);
            } elseif (is_object($value)) {
                // Convert any remaining objects to string to avoid JSON failures
                $data[$key] = method_exists($value, '__toString') ? (string) $value : get_class($value);
            }
        }

        return $data;
    }

    protected function isSensitiveKey(string $key): bool
    {
        $key = strtolower($key);
        foreach ($this->sensitiveKeys as $sensitive) {
            if (str_contains($key, $sensitive)) {
                return true;
            }
        }

        return false;
    }
}
