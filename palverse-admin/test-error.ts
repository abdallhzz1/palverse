import { normalizeApiError } from './src/lib/api/error';

const fakeAxiosError = {
  response: {
    status: 422,
    data: {
      message: 'Invalid data',
      errors: { email: ['Taken'] }
    }
  }
};

console.log("=== First Pass ===");
const e1 = normalizeApiError(fakeAxiosError);
console.log(e1);

console.log("\n=== Second Pass ===");
const e2 = normalizeApiError(e1);
console.log(e2);
