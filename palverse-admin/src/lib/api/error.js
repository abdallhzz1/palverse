"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeApiError = normalizeApiError;
exports.getFieldErrors = getFieldErrors;
exports.isUnauthenticatedError = isUnauthenticatedError;
function normalizeApiError(error) {
    var err = error;
    // Prevent double normalization if interceptor already handled it
    if (err && err._isNormalized) {
        return err;
    }
    var defaultError = {
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
    var _a = err.response, status = _a.status, data = _a.data, headers = _a.headers;
    var requestId = headers === null || headers === void 0 ? void 0 : headers["x-request-id"];
    // Use backend provided message or fallback
    var message = (data === null || data === void 0 ? void 0 : data.message) || defaultError.message;
    if (status === 401) {
        return { status: status, code: "UNAUTHENTICATED", message: "جلسة غير مصرح بها", requestId: requestId, _isNormalized: true };
    }
    if (status === 403) {
        return { status: status, code: "FORBIDDEN", message: "ليس لديك صلاحية للقيام بهذا الإجراء", requestId: requestId, _isNormalized: true };
    }
    if (status === 404) {
        return { status: status, code: "NOT_FOUND", message: "المورد غير موجود", requestId: requestId, _isNormalized: true };
    }
    if (status === 422) {
        return {
            status: status,
            code: "VALIDATION_ERROR",
            message: message !== defaultError.message ? message : "البيانات المدخلة غير صالحة",
            details: data === null || data === void 0 ? void 0 : data.errors,
            requestId: requestId,
            _isNormalized: true,
        };
    }
    if (status === 409) {
        return { status: status, code: "CONFLICT", message: message, requestId: requestId, _isNormalized: true };
    }
    if (status === 429) {
        return { status: status, code: "RATE_LIMIT", message: "تم تجاوز الحد المسموح به من الطلبات", requestId: requestId, _isNormalized: true };
    }
    return { status: status, code: "HTTP_".concat(status), message: message, requestId: requestId, _isNormalized: true };
}
function getFieldErrors(error, field) {
    if (error.code !== "VALIDATION_ERROR" || !error.details) {
        return undefined;
    }
    return error.details[field];
}
function isUnauthenticatedError(error) {
    return error.code === "UNAUTHENTICATED";
}
