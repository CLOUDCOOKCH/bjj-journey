/**
 * Base API client for making authenticated requests from the client side.
 * Uses NextAuth's session to include credentials with requests.
 */

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Makes an authenticated API request using NextAuth credentials
 */
async function apiRequest<T>(
  endpoint: string,
  method: RequestMethod,
  body?: unknown
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for NextAuth session
  };

  if (body !== undefined && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);

  // Handle non-JSON responses (like 204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'An unexpected error occurred';
    throw new Error(message);
  }

  return response.json();
}

/**
 * GET request
 */
export function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, 'GET');
}

/**
 * POST request
 */
export function post<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, 'POST', body);
}

/**
 * PATCH request
 */
export function patch<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, 'PATCH', body);
}

/**
 * DELETE request
 */
export function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, 'DELETE');
}
