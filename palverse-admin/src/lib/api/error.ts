export interface NormalizedApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId?: string;
  _isNormalized?: boolean;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  const err = error as any;
  
  // Prevent double normalization if interceptor already handled it
  if (err && err._isNormalized) {
    return err as NormalizedApiError;
  }

  const defaultError: NormalizedApiError = {
    status: 500,
    code: "SERVER_ERROR",
    message: "حدث خطأ في الخادم",
    _isNormalized: true,
  };

  if (!err || !err.response) {
    if (err.code === "ECONNABORTED") {
      return {
        status: 408,
        code: "TIMEOUT",
        message: "انتهى وقت الاتصال بالخادم",
        _isNormalized: true,
      };
    }
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت",
      _isNormalized: true,
    };
  }

  const { status, data, headers } = err.response;
  const requestId = headers?.["x-request-id"];

  // Use backend provided message or fallback
  const message = data?.message || defaultError.message;
  
  if (status === 401) {
    return { status, code: "UNAUTHENTICATED", message: "جلسة غير مصرح بها", requestId, _isNormalized: true };
  }
  
  if (status === 403) {
    return { status, code: "FORBIDDEN", message: "ليس لديك صلاحية للقيام بهذا الإجراء", requestId, _isNormalized: true };
  }

  if (status === 404) {
    return { status, code: "NOT_FOUND", message: "المورد غير موجود", requestId, _isNormalized: true };
  }

  const translateError = (errStr: string) => {
    let text = errStr;
    text = text.replace(/The email has already been taken\.?/i, "البريد الإلكتروني مستخدم مسبقاً");
    text = text.replace(/The phone has already been taken\.?/i, "رقم الهاتف مستخدم مسبقاً");
    text = text.replace(/The (.*?) has already been taken\.?/i, "هذه القيمة مستخدمة مسبقاً");
    text = text.replace(/The given data was invalid\.?/i, "البيانات المدخلة غير صالحة");
    text = text.replace(/The (.*?) field is required\.?/i, "هذا الحقل مطلوب");
    text = text.replace(/The (.*?) must be at least (.*?) characters\.?/i, "يجب أن يحتوي على الأقل $2 أحرف");
    text = text.replace(/The (.*?) must not be greater than (.*?) characters\.?/i, "يجب ألا يتجاوز $2 حرفاً");
    text = text.replace(/The (.*?) must be a valid email address\.?/i, "البريد الإلكتروني غير صالح");
    text = text.replace(/These credentials do not match our records\.?/i, "بيانات الدخول غير صحيحة");
    return text;
  };

  if (status === 422) {
    const translatedDetails: Record<string, string[]> = {};
    if (data?.errors) {
      Object.keys(data.errors).forEach(key => {
        translatedDetails[key] = data.errors[key].map((msg: string) => translateError(msg));
      });
    }

    return {
      status,
      code: "VALIDATION_ERROR",
      message: message !== defaultError.message ? translateError(message) : "البيانات المدخلة غير صالحة",
      details: translatedDetails,
      requestId,
      _isNormalized: true,
    };
  }

  if (status === 409) {
    return { status, code: "CONFLICT", message: translateError(message), requestId, _isNormalized: true };
  }

  if (status === 429) {
    return { status, code: "RATE_LIMIT", message: "تم تجاوز الحد المسموح به من الطلبات", requestId, _isNormalized: true };
  }

  return { status, code: `HTTP_${status}`, message: translateError(message), requestId, _isNormalized: true };
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
