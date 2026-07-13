# Palverse API Response Standard

This document defines the JSON response standard, HTTP status codes, localized output formatting, and error handling structures for the Palverse REST API.

---

## 1. General Response Envelope

Every API response must return a standardized JSON envelope.

### Success Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {}
}
```

### Error Response Envelope
```json
{
  "success": false,
  "message": "An error occurred.",
  "error": {
    "code": "ERROR_CODE_NAME",
    "details": {}
  }
}
```

---

## 2. Success Structure Definitions

### A. Single-Resource Response
Returns a single entity in the `data` wrapper.
```json
{
  "success": true,
  "message": "Store profile retrieved successfully.",
  "data": {
    "slug": "al-yasmin-supermarket",
    "name_ar": "سوبرماركت الياسمين",
    "name_en": "Al-Yasmin Supermarket",
    "status": "approved"
  },
  "meta": {
    "correlation_id": "c3b0ac82-7241-4876-b51f-d2003c200424"
  }
}
```

### B. Collection Response (Paginated)
Lists multiple entities under `data`, accompanied by standard cursor or offset pagination metadata in `meta` and links in `links`.
```json
{
  "success": true,
  "message": "Stores retrieved successfully.",
  "data": [
    {
      "slug": "al-yasmin-supermarket",
      "name_ar": "سوبرماركت الياسمين"
    }
  ],
  "meta": {
    "correlation_id": "c3b0ac82-7241-4876-b51f-d2003c200424",
    "pagination": {
      "total": 120,
      "count": 15,
      "per_page": 15,
      "current_page": 1,
      "total_pages": 8
    }
  },
  "links": {
    "first": "https://api.palverse.ps/api/v1/stores?page=1",
    "last": "https://api.palverse.ps/api/v1/stores?page=8",
    "prev": null,
    "next": "https://api.palverse.ps/api/v1/stores?page=2"
  }
}
```

---

## 3. Error Structure Definitions

### A. Validation Error (HTTP 422)
```json
{
  "success": false,
  "message": "بيانات المدخلات غير صالحة. (Invalid inputs provided.)",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "name_ar": [
        "الاسم باللغة العربية مطلوب."
      ],
      "latitude": [
        "يجب تحديد الإحداثيات الجغرافية بشكل صحيح."
      ]
    }
  }
}
```

### B. Authentication Error (HTTP 401)
```json
{
  "success": false,
  "message": "يجب تسجيل الدخول أولاً للوصول إلى هذا المصدر.",
  "error": {
    "code": "UNAUTHENTICATED",
    "details": {}
  }
}
```

### C. Authorization Error (HTTP 403)
```json
{
  "success": false,
  "message": "ليس لديك الصلاحية الكافية لإجراء هذه العملية.",
  "error": {
    "code": "UNAUTHORIZED_ACTION",
    "details": {}
  }
}
```

### D. Not Found Error (HTTP 404)
```json
{
  "success": false,
  "message": "المصدر المطلوب غير موجود.",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "details": {}
  }
}
```

### E. Business Rule Conflict (HTTP 409)
Occurs when an action violates a business model rule (e.g., uploading an 11th image when the maximum gallery limit is 10).
```json
{
  "success": false,
  "message": "لا يمكن إضافة أكثر من 10 صور للمعرض الخاص بالمتجر.",
  "error": {
    "code": "MAX_GALLERY_LIMIT_EXCEEDED",
    "details": {
      "limit": 10,
      "current_count": 10
    }
  }
}
```

### F. Rate Limit Error (HTTP 429)
```json
{
  "success": false,
  "message": "طلبات كثيرة جداً، يرجى المحاولة لاحقاً.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "retry_after_seconds": 60
    }
  }
}
```

### G. Internal Server Error (HTTP 500)
```json
{
  "success": false,
  "message": "حدث خطأ داخلي في الخادم.",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "details": {
      "correlation_id": "92f3922c-a21b-422e-a342-c12e2c4516df"
    }
  }
}
```

---

## 4. HTTP Status Code Rules

The API uses standard HTTP response codes:
*   `200 OK`: Successful read or update execution.
*   `201 Created`: Successful resource creation (e.g., store submission).
*   `204 No Content`: Successful deletion execution (returns empty body).
*   `400 Bad Request`: Input syntax formatting issues.
*   `401 Unauthenticated`: Sanctum token missing or expired.
*   `403 Forbidden`: Mismatch of owner privileges or roles.
*   `404 Not Found`: Store slug or user UUID not found.
*   `409 Conflict`: Business rule limits violated.
*   `422 Unprocessable Entity`: Form validation errors.
*   `429 Too Many Requests`: Rate limiter triggered.
*   `500 Internal Server Error`: Exceptions or database failures.

---

## 5. Localization of Messages

*   **Accept-Language Header**: The client sends the language preference via the standard header:
    *   `Accept-Language: ar` (Arabic, default)
    *   `Accept-Language: en` (English)
*   **Response Localization**: The `message` field and validation error messages inside `error.details` must be returned in the requested language.

---

## 6. Correlation IDs

*   **Purpose**: Tracking requests through error logs.
*   **Header**: Every API response must include a `X-Correlation-ID` header. The correlation ID is also embedded inside `meta` (for successful responses) or `error.details` (for server errors).
