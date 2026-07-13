/**
 * api.ts — Customer-facing API client
 * ─────────────────────────────────────────────────────────────────────────────
 * Dùng cho các trang public & customer: auth, products, cart, orders…
 * Auth: Bearer token từ Zustand store (accessToken)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API_BASE_URL, resolveAssetUrl } from './api-config';
import { useAuthStore } from '../store/useAuthStore';

// Re-export helper để các component vẫn dùng được
export { resolveAssetUrl as resolveUploadUrl };

/** Backward-compatible export (một số component import trực tiếp) */
export const BACKEND_BASE = API_BASE_URL.replace(/\/api\/v1\/?$/i, '');

// ─────────────────────────────────────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string, statusCode: number, error: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * apiFetch — typed fetch wrapper cho customer API.
 *
 * - Tự động đính kèm Bearer token từ useAuthStore
 * - Unwrap response `{ success, data }` (NestJS TransformInterceptor pattern)
 * - Throw ApiError khi response không OK
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(options?.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Optimize: Set 1500ms timeout to prevent hanging when backend is offline
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: options?.credentials ?? 'include',
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();

    if (!response.ok) {
      throw new ApiError(
        json.message ?? 'Something went wrong',
        json.statusCode ?? response.status,
        json.error ?? 'Bad Request',
      );
    }

    return json.data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('API request timeout', 408, 'Timeout');
    }
    throw error;
  }
}
