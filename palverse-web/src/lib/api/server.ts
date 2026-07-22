import { env } from '../env';

export interface ServerFetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function serverFetch<T = unknown>(endpoint: string, options: ServerFetchOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;
  
  // Construct URL with query parameters
  const url = new URL(`${env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Merge default headers
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Accept')) {
    mergedHeaders.set('Accept', 'application/json');
  }
  if (!mergedHeaders.has('Accept-Language')) {
    mergedHeaders.set('Accept-Language', env.NEXT_PUBLIC_APP_LOCALE || 'ar');
  }

  try {
    const response = await fetch(url.toString(), {
      headers: mergedHeaders,
      ...restOptions,
    });

    // Parse JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
      const enhancedError = new Error(errorMessage);
      (enhancedError as unknown as Record<string, unknown>).status = response.status;
      (enhancedError as unknown as Record<string, unknown>).data = data || null;
      throw enhancedError;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during server fetch.');
  }
}
