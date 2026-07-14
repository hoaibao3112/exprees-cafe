import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminServicesApi } from '../lib/admin-api';
import { apiFetch } from '../lib/api';

export interface ServiceItem {
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

// ===================== CUSTOMER / PUBLIC HOOKS =====================
export function useServicesQuery() {
  return useQuery<ServiceItem[], Error>({
    queryKey: ['services'],
    queryFn: () => apiFetch<ServiceItem[]>('/services?status=ACTIVE'),
  });
}

export function useServiceByIdQuery(id: string) {
  return useQuery<ServiceItem, Error>({
    queryKey: ['services', id],
    queryFn: () => apiFetch<ServiceItem>(`/services/${id}`),
    enabled: !!id,
  });
}

// ===================== ADMIN HOOKS =====================
export function useAdminServicesQuery() {
  return useQuery<ServiceItem[], Error>({
    queryKey: ['admin-services'],
    queryFn: () => adminServicesApi.getAll(),
  });
}

export function useAdminServiceByIdQuery(id: string) {
  return useQuery<ServiceItem, Error>({
    queryKey: ['admin-services', id],
    queryFn: () => adminServicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation<ServiceItem, Error, Partial<ServiceItem>>({
    mutationFn: (data) => adminServicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation<ServiceItem, Error, { id: string; data: Partial<ServiceItem> }>({
    mutationFn: ({ id, data }) => adminServicesApi.update(id, data),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-services', updatedData.id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', updatedData.id] });
    },
  });
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => adminServicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
