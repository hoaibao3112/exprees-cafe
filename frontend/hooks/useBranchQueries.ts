import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  openingHours?: { open: string; close: string };
  status: string;
  isFlagship: boolean;
  distanceKm?: number;
  imageUrl?: string;
}

export function useBranchesQuery(status?: string) {
  return useQuery<Branch[], ApiError>({
    queryKey: ['branches', status],
    queryFn: () => {
      const queryParams = status ? `?status=${status}` : '';
      return apiFetch<Branch[]>(`/branches${queryParams}`);
    },
  });
}

export function useNearestBranchesQuery(lat: number, lng: number, maxDistanceKm = 50, enabled = false) {
  return useQuery<Branch[], ApiError>({
    queryKey: ['branches', 'nearest', lat, lng, maxDistanceKm],
    queryFn: () =>
      apiFetch<Branch[]>(`/branches/nearest?lat=${lat}&lng=${lng}&maxDistanceKm=${maxDistanceKm}`),
    enabled: enabled && !!lat && !!lng,
  });
}
