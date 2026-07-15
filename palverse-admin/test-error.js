"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./src/lib/api/error");
var fakeAxiosError = {
    response: {
        status: 422,
        data: {
            message: 'Invalid data',
            errors: { email: ['Taken'] }
        }
    }
};
console.log("=== First Pass ===");
var e1 = (0, error_1.normalizeApiError)(fakeAxiosError);
console.log(e1);
console.log("\n=== Second Pass ===");
var e2 = (0, error_1.normalizeApiError)(e1);
console.log(e2);
