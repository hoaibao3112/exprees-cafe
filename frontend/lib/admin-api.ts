/**
 * Admin API Service
 * Tự động đính kèm token từ cookie vào header
 * Xử lý lỗi 401 → redirect /admin/login
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const COOKIE_NAME = 'admin_token';

// Helper: lấy cookie ở client-side
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Token hết hạn → redirect login
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
      json?.message ??
      json?.error ??
      `Lỗi server (${res.status})`;
    throw new AdminApiError(message, res.status, json);
  }

  // Backend NestJS trả { success, data } hoặc { data } hoặc trực tiếp
  return (json?.data ?? json) as T;
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getCookie(COOKIE_NAME);

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(res);
}

// ===================== AUTH =====================
export const adminAuthApi = {
  login: (email: string, password: string) =>
    adminFetch<{ accessToken: string; user: { id: string; email: string; name: string; role: any } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    ),
};

// ===================== DASHBOARD =====================
export const adminDashboardApi = {
  getStats: () =>
    adminFetch<{
      totalArticles: number;
      totalBranches: number;
      activeBanners: number;
      unreadContacts: number;
      recentArticles: unknown[];
      recentContacts: unknown[];
    }>('/admin/dashboard/stats'),
};

// ===================== ARTICLES =====================
export const adminArticlesApi = {
  getAll: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {})
    ).toString() : '';
    return adminFetch<{ items: unknown[]; total: number; page: number; limit: number }>(
      `/admin/articles${qs}`,
    );
  },
  getById: (id: string) => adminFetch<unknown>(`/admin/articles/${id}`),
  create: (data: unknown) =>
    adminFetch<unknown>('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    adminFetch<unknown>(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/admin/articles/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) =>
    adminFetch<unknown>(`/admin/articles/${id}/toggle-status`, {
      method: 'PATCH',
    }),
};

// ===================== BRANCHES =====================
export const adminBranchesApi = {
  getAll: () => adminFetch<{ items: unknown[]; total: number }>('/admin/branches'),
  getById: (id: string) => adminFetch<unknown>(`/admin/branches/${id}`),
  create: (data: unknown) =>
    adminFetch<unknown>('/admin/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    adminFetch<unknown>(`/admin/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/admin/branches/${id}`, { method: 'DELETE' }),
  toggleStatus: (id: string) =>
    adminFetch<unknown>(`/admin/branches/${id}/toggle-status`, {
      method: 'PATCH',
    }),
};

// ===================== BANNERS =====================
export const adminBannersApi = {
  getAll: () => adminFetch<unknown[]>('/admin/banners'),
  update: (id: string, data: unknown) =>
    adminFetch<unknown>(`/admin/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  reorder: (items: { id: string; order: number }[]) =>
    adminFetch<void>('/admin/banners/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    }),
};

// ===================== CONTACTS =====================
export const adminContactsApi = {
  getAll: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {})
    ).toString() : '';
    return adminFetch<{ items: unknown[]; total: number }>(`/admin/contacts${qs}`);
  },
  markRead: (id: string) =>
    adminFetch<unknown>(`/admin/contacts/${id}/read`, { method: 'PATCH' }),
};

// ===================== SETTINGS =====================
export const adminSettingsApi = {
  getAll: () => adminFetch<Record<string, string>>('/admin/settings'),
  update: (data: Record<string, string | boolean | number>) =>
    adminFetch<void>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ===================== SERVICES =====================
export const adminServicesApi = {
  getAll: () => adminFetch<any[]>('/services'),
  getById: (id: string) => adminFetch<any>(`/services/${id}`),
  create: (data: any) =>
    adminFetch<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    adminFetch<any>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    adminFetch<void>(`/services/${id}`, { method: 'DELETE' }),
};
