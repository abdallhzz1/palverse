<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

/**
 * Represents a predictable, domain-level business rule violation.
 *
 * Throw this exception when an action is logically invalid given the
 * current state of the data (e.g., approving an already-approved store,
 * exceeding a gallery limit). The exception carries a stable error code,
 * an HTTP status, and optional structured details that will be rendered
 * directly into the standard API error envelope by the exception handler.
 *
 * Usage:
 *   throw new BusinessException('STORE_ALREADY_APPROVED', 409, 'المتجر معتمد مسبقاً.');
 *   throw new BusinessException('MAX_GALLERY_LIMIT_EXCEEDED', 409, 'لا يمكن إضافة المزيد من الصور.', ['limit' => 10]);
 */
class BusinessException extends RuntimeException
{
    /**
     * @param  string  $errorCode  A stable, machine-readable uppercase error code (e.g. STORE_ALREADY_APPROVED).
     * @param  int  $httpStatus  HTTP status code (4xx range).
     * @param  string  $message  Arabic (default) human-readable message shown in the response `message` field.
     * @param  array<string, mixed>  $details  Optional structured context included in `error.details`.
     */
    public function __construct(
        protected string $errorCode,
        int $httpStatus = 409,
        string $message = 'حدث خطأ في قواعد العمل.',
        protected array $details = [],
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $httpStatus, $previous);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getHttpStatus(): int
    {
        return $this->code;
    }

    public function getDetails(): array
    {
        return $this->details;
    }
}
