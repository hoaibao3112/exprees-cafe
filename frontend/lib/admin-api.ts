/**
 * admin-api.ts — Admin panel API client
 * ─────────────────────────────────────────────────────────────────────────────
 * Dùng cho tất cả các trang /admin/*
 * Auth: JWT lấy từ cookie `admin_token` (set bởi backend sau khi login)
 *
 * Khi backend mới sẵn sàng → chỉ cần đổi NEXT_PUBLIC_API_URL trong .env.local
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { API_BASE_URL, ADMIN_COOKIE_NAME } from './api-config';

// Re-export từ admin.types.ts để toàn bộ app dùng 1 nguồn types
export type {
  AdminUser,
  DashboardStats,
  RecentArticle,
  RecentContact,
  Article,
  ArticleListResponse,
  ArticleStatus,
  BlogHandle,
  CreateArticleInput,
  UpdateArticleInput,
  Branch,
  BranchListResponse,
  BranchStatus,
  CreateBranchInput,
  UpdateBranchInput,
  Banner,
  UpdateBannerInput,
  Contact,
  ContactListResponse,
  SiteSettings,
  PaginationParams,
  ApiListResponse,
} from '../types/admin.types';

import type {
  Article,
  ArticleListResponse,
  Branch,
  BranchListResponse,
  Banner,
  Contact,
  ContactListResponse,
  DashboardStats,
} from '../types/admin.types';

// ─────────────────────────────────────────────────────────────────────────────
// Extra types không có trong admin.types.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaUploadResult {
  id: string;
  cdnUrl: string;
}

export interface Service {
  id: string;
  name: string;
  url?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FranchisePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  isActive: boolean;
}

export interface ContentVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  isActive: boolean;
  order?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error class
// ─────────────────────────────────────────────────────────────────────────────

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

function buildQueryString(params?: Record<string, string | number>): string {
  if (!params) return '';
  const entries = Object.entries(params).reduce<Record<string, string>>(
    (acc, [k, v]) => {
      acc[k] = String(v);
      return acc;
    },
    {},
  );
  return '?' + new URLSearchParams(entries).toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login?error=session_expired';
    }
    throw new AdminApiError('Phiên đăng nhập hết hạn', 401);
  }

  if (res.status === 403) {
    throw new AdminApiError('Bạn không có quyền thực hiện thao tác này', 403);
  }

  if (res.status === 404) {
    throw new AdminApiError('Không tìm thấy dữ liệu', 404);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (json?.message as string | undefined) ??
      (json?.error as string | undefined) ??
      `Lỗi server (${res.status})`;
    throw new AdminApiError(message, res.status, json);
  }

  // NestJS TransformInterceptor: { success: true, data: ... }
  return (json?.data ?? json) as T;
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getCookie(ADMIN_COOKIE_NAME);

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const adminAuthApi = {
  login: (email: string, password: string) =>
    adminFetch<{ accessToken: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const adminDashboardApi = {
  getStats: () => adminFetch<DashboardStats>('/admin/dashboard/stats'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

export const adminArticlesApi = {
  getAll: (params?: Record<string, string | number>) =>
    adminFetch<ArticleListResponse>(
      `/admin/articles${buildQueryString(params)}`,
    ),
  getById: (id: string) => adminFetch<Article>(`/admin/articles/${id}`),
  create: (data: Record<string, unknown>) =>
    adminFetch<Article>('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    adminFetch<Article>(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/admin/articles/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) =>
    adminFetch<Article>(`/admin/articles/${id}/toggle-status`, {
      method: 'PATCH',
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// BRANCHES
// ─────────────────────────────────────────────────────────────────────────────

export const adminBranchesApi = {
  getAll: () => adminFetch<BranchListResponse>('/admin/branches'),
  getById: (id: string) => adminFetch<Branch>(`/admin/branches/${id}`),
  create: (data: Record<string, unknown>) =>
    adminFetch<Branch>('/admin/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    adminFetch<Branch>(`/admin/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/admin/branches/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) =>
    adminFetch<Branch>(`/admin/branches/${id}/toggle-status`, {
      method: 'PATCH',
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────────────────

export const adminBannersApi = {
  getAll: () => adminFetch<Banner[]>('/admin/banners'),
  update: (id: string, data: Record<string, unknown>) =>
    adminFetch<Banner>(`/admin/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  reorder: (items: { id: string; order: number }[]) =>
    adminFetch<void>('/admin/banners/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTS
// ─────────────────────────────────────────────────────────────────────────────

export const adminContactsApi = {
  getAll: (params?: Record<string, string | number>) =>
    adminFetch<ContactListResponse>(
      `/admin/contacts${buildQueryString(params)}`,
    ),
  markRead: (id: string) =>
    adminFetch<Contact>(`/admin/contacts/${id}/read`, { method: 'PATCH' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export const adminSettingsApi = {
  getAll: () => adminFetch<Record<string, string>>('/admin/settings'),
  update: (data: Record<string, string | boolean | number>) =>
    adminFetch<void>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA / UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

export const adminMediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return adminFetch<MediaUploadResult>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const adminServicesApi = {
  getAll: () => adminFetch<Service[]>('/services'),
  getById: (id: string) => adminFetch<Service>(`/services/${id}`),
  create: (data: Partial<Service>) =>
    adminFetch<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Service>) =>
    adminFetch<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/services/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// FRANCHISE PACKAGES
// ─────────────────────────────────────────────────────────────────────────────

export const adminFranchiseApi = {
  getAll: () => adminFetch<FranchisePackage[]>('/franchise/packages'),
  getById: (id: string) =>
    adminFetch<FranchisePackage>(`/franchise/packages/${id}`),
  create: (data: Partial<FranchisePackage>) =>
    adminFetch<FranchisePackage>('/franchise/admin/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<FranchisePackage>) =>
    adminFetch<FranchisePackage>(`/franchise/admin/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/franchise/admin/packages/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE VIDEOS
// ─────────────────────────────────────────────────────────────────────────────

export const adminVideosApi = {
  getAll: () => adminFetch<ContentVideo[]>('/content/videos'),
  getById: (id: string) => adminFetch<ContentVideo>(`/content/videos/${id}`),
  create: (data: Partial<ContentVideo>) =>
    adminFetch<ContentVideo>('/content/admin/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ContentVideo>) =>
    adminFetch<ContentVideo>(`/content/admin/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/content/admin/videos/${id}`, { method: 'DELETE' }),
};
