import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';
import { adminFranchiseApi } from '../lib/admin-api';

export interface FranchisePackage {
  id: string;
  name: string;
  modelType: string;
  investmentFrom: number;
  description: string;
  images?: string[];
  isActive: boolean;
}

export interface FranchiseApplicationPayload {
  packageId: string;
  applicantName: string;
  phone: string;
  province: string;
  notes?: string;
}

export interface FranchiseApplicationResponse {
  id: string;
  userId: string;
  packageId: string;
  applicantName: string;
  phone: string;
  province: string;
  status: string;
  notes?: string;
  submittedAt: string;
}

export function useFranchisePackagesQuery() {
  return useQuery<FranchisePackage[], ApiError>({
    queryKey: ['franchise-packages'],
    queryFn: () => apiFetch<FranchisePackage[]>('/franchise/packages'),
  });
}

export function useFranchisePackageByIdQuery(id: string) {
  return useQuery<FranchisePackage, ApiError>({
    queryKey: ['franchise-package', id],
    queryFn: () => apiFetch<FranchisePackage>(`/franchise/packages/${id}`),
    enabled: !!id,
  });
}

export function useApplyFranchiseMutation() {
  const queryClient = useQueryClient();
  return useMutation<FranchiseApplicationResponse, ApiError, FranchiseApplicationPayload>({
    mutationFn: (data) =>
      apiFetch<FranchiseApplicationResponse>('/franchise/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-applications'] });
    },
  });
}

export function useCreateFranchisePackageMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (data) => adminFranchiseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-packages'] });
    },
  });
}

export function useUpdateFranchisePackageMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => adminFranchiseApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['franchise-packages'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-package', id] });
    },
  });
}

export function useDeleteFranchisePackageMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => adminFranchiseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-packages'] });
    },
  });
}
