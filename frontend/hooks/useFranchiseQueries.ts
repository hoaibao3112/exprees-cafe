import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface FranchisePackage {
  id: string;
  name: string;
  modelType: string;
  investmentFrom: number;
  description: string;
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
