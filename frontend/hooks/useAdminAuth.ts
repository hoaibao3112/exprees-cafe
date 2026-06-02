'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminUser } from '@/types/admin.types';

const COOKIE_NAME = 'admin_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

function parseJwtPayload(token: string): AdminUser | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    return {
      id: String(payload.id ?? payload.sub ?? ''),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? payload.email ?? 'Admin'),
      role: String(payload.role ?? 'admin'),
    };
  } catch {
    return null;
  }
}

export function useAdminAuth() {
  const router = useRouter();

  const getUser = useCallback((): AdminUser | null => {
    const token = getCookie(COOKIE_NAME);
    if (!token) return null;
    return parseJwtPayload(token);
  }, []);

  const logout = useCallback(() => {
    // Xóa cookie admin_token
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    router.push('/admin/login');
  }, [router]);

  const isAuthenticated = useCallback((): boolean => {
    return !!getCookie(COOKIE_NAME);
  }, []);

  return {
    user: getUser(),
    isAuthenticated: isAuthenticated(),
    logout,
  };
}
