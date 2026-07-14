export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId?: string;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  const defaultError: NormalizedApiError = {
    status: 500,
    code: "SERVER_ERROR",
    message: "حدث خطأ في الخادم",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  if (!err.response) {
    if (err.code === "ECONNABORTED") {
      return {
        status: 408,
        code: "TIMEOUT",
        message: "انتهى وقت الاتصال بالخادم",
      };
    }
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت",
    };
  }

  const { status, data, headers } = err.response;
  const requestId = headers?.["x-request-id"];

  // Use backend provided message or fallback
  const message = data?.message || defaultError.message;
  
  if (status === 401) {
    return { status, code: "UNAUTHENTICATED", message: "جلسة غير مصرح بها", requestId };
  }
  
  if (status === 403) {
    return { status, code: "FORBIDDEN", message: "ليس لديك صلاحية للقيام بهذا الإجراء", requestId };
  }

  if (status === 404) {
    return { status, code: "NOT_FOUND", message: "المورد غير موجود", requestId };
  }

  if (status === 422) {
    return {
      status,
      code: "VALIDATION_ERROR",
      message: message !== defaultError.message ? message : "البيانات المدخلة غير صالحة",
      details: data?.errors,
      requestId,
    };
  }

  if (status === 409) {
    return { status, code: "CONFLICT", message, requestId };
  }

  if (status === 429) {
    return { status, code: "RATE_LIMIT", message: "تم تجاوز الحد المسموح به من الطلبات", requestId };
  }

  return { status, code: `HTTP_${status}`, message, requestId };
}

export function getFieldErrors(error: NormalizedApiError, field: string): string[] | undefined {
  if (error.code !== "VALIDATION_ERROR" || !error.details) {
    return undefined;
  }
  return error.details[field];
}

export function isUnauthenticatedError(error: NormalizedApiError): boolean {
  return error.code === "UNAUTHENTICATED";
}
