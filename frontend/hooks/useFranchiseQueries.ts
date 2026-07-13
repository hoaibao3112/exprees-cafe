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

const MOCK_PACKAGES: FranchisePackage[] = [
  {
    id: 'express-package',
    name: 'MÔ HÌNH QUÁN TINH GỌN',
    modelType: 'EXPRESS',
    investmentFrom: 0,
    description: 'Thiết kế tinh gọn, sang trọng tối ưu diện tích từ 30m² - 50m².',
    isActive: true,
    images: ['/media__1780386795847.png']
  },
  {
    id: 'kiosk-package',
    name: 'MÔ HÌNH XE TAKE AWAY LINH ĐỘNG',
    modelType: 'KIOSK',
    investmentFrom: 0,
    description: 'Linh động và hiệu quả tối đa cho lưu lượng khách đi đường ngắn.',
    isActive: true,
    images: ['/media__1780386795859.png']
  },
  {
    id: 'premium-package',
    name: 'MÔ HÌNH KIOSK TIỆN LỢI',
    modelType: 'PREMIUM',
    investmentFrom: 0,
    description: 'Lắp đặt tại trung tâm thương mại, sảnh tòa nhà hoặc chung cư.',
    isActive: true,
    images: ['/media__1780386795867.png']
  }
];

export function useFranchisePackagesQuery() {
  return useQuery<FranchisePackage[], ApiError>({
    queryKey: ['franchise-packages'],
    queryFn: async () => {
      try {
        const data = await apiFetch<FranchisePackage[]>('/franchise/packages');
        return data && data.length > 0 ? data : MOCK_PACKAGES;
      } catch (err) {
        console.warn('API /franchise/packages offline, falling back to mock packages:', err);
        return MOCK_PACKAGES;
      }
    },
  });
}

export function useFranchisePackageByIdQuery(id: string) {
  return useQuery<FranchisePackage, ApiError>({
    queryKey: ['franchise-package', id],
    queryFn: async () => {
      try {
        return await apiFetch<FranchisePackage>(`/franchise/packages/${id}`);
      } catch (err) {
        console.warn(`API /franchise/packages/${id} offline, falling back to mock:`, err);
        return MOCK_PACKAGES.find(p => p.id === id) || MOCK_PACKAGES[0];
      }
    },
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
