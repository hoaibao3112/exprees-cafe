/**
 * api-config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized API configuration.
 * Khi backend mới sẵn sàng, chỉ cần cập nhật .env.local — không cần sửa code.
 *
 * Required env vars (xem .env.example):
 *   NEXT_PUBLIC_API_URL       — base URL của API, e.g. https://api.expresscafe.vn/api/v1
 *   NEXT_PUBLIC_BACKEND_URL   — base host (không có /api/v1), dùng để resolve asset URL
 *   JWT_SECRET                — server-side only, dùng trong middleware.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Base URL của REST API (bao gồm prefix /api/v1) */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? '';

/** Base host của backend — dùng để resolve URL asset (uploads, images…) */
export const BACKEND_HOST: string =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  API_BASE_URL.replace(/\/api\/v1\/?$/i, '');

/** Tên cookie lưu admin JWT token */
export const ADMIN_COOKIE_NAME = 'admin_token' as const;

/** Tên cookie lưu refresh token (HttpOnly, set bởi backend) */
export const REFRESH_COOKIE_NAME = 'refresh_token' as const;

/**
 * Resolve đường dẫn asset upload (relative path) thành absolute URL.
 * Ví dụ: "uploads/img.jpg" → "https://api.expresscafe.vn/uploads/img.jpg"
 */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return '';

  // Normalize: bỏ prefix localhost nếu có (dev artifact)
  let normalized = path.startsWith('http://localhost:')
    ? path.replace(/^http:\/\/localhost:\d+/, '')
    : path;

  // Đã là absolute URL → trả về nguyên
  if (/^https?:\/\//.test(normalized) || normalized.startsWith('//')) {
    return normalized;
  }

  // Nếu là các asset tĩnh trong thư mục public của frontend -> trả về đường dẫn relative gốc
  if (
    normalized.startsWith('/media__') ||
    normalized.startsWith('media__') ||
    normalized.startsWith('/slideshow_') ||
    normalized.startsWith('slideshow_') ||
    normalized.startsWith('/logo.png') ||
    normalized.startsWith('logo.png') ||
    normalized.startsWith('/p-about') ||
    normalized.startsWith('p-about') ||
    normalized.startsWith('/h-about') ||
    normalized.startsWith('h-about')
  ) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  const base = BACKEND_HOST.replace(/\/$/, '');
  const segment = normalized.replace(/^\//, '');
  return `${base}/${segment}`;
}
