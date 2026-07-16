import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';
import type { SiteSettings } from '../types/admin.types';

export function useSettingsQuery() {
  return useQuery<SiteSettings, ApiError>({
    queryKey: ['settings', 'public'],
    queryFn: () => apiFetch<SiteSettings>('/admin/settings/public'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since settings change rarely
  });
}
