import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
// Base host for serving uploaded static assets (no trailing slash)
export const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || API_URL.replace(/\/api\/v1\/?$/i, '');

// Resolve an uploaded asset path (e.g. "uploads/...jpg") to a full URL.
// Falls back to localhost:3000 in development when no explicit BACKEND URL is provided.
export function resolveUploadUrl(path?: string | null) {
  if (!path) return '';
  // If already absolute (http(s) or protocol-relative), return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }

  const fallbackDev = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL || API_URL.replace(/\/api\/v1\/?$/i, '')) || fallbackDev;

  // Ensure no duplicate slashes when joining
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

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

  // Credentials are set to include to enable HttpOnly refresh tokens cookie passing
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: options?.credentials || 'include',
  });

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(
      json.message || 'Something went wrong',
      json.statusCode || response.status,
      json.error || 'Bad Request',
    );
  }

  // Return the raw data unwrapped from the standard transform interceptor `{ success, data }`
  return json.data as T;
}
