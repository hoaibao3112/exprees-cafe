import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore, User } from '../store/useAuthStore';

export interface Address {
  id: string;
  title: string;
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface LoyaltyHistory {
  id: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface LoyaltyInfo {
  loyaltyPoints: number;
  history: LoyaltyHistory[];
}

export function useUserQueries(userId?: string) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  const updateProfileMutation = useMutation<User, ApiError, { name?: string; phoneNumber?: string }>({
    mutationFn: (data) =>
      apiFetch<User>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(['me'], updatedUser);
    },
  });

  const addressesQuery = useQuery<Address[], ApiError>({
    queryKey: ['addresses', userId],
    queryFn: () => apiFetch<Address[]>(`/users/${userId}/addresses`),
    enabled: !!userId,
  });

  const createAddressMutation = useMutation<Address, ApiError, Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }>({
    mutationFn: (data) =>
      apiFetch<Address>(`/users/${userId}/addresses`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  const updateAddressMutation = useMutation<Address, ApiError, { addressId: string; data: Partial<Address> }>({
    mutationFn: ({ addressId, data }) =>
      apiFetch<Address>(`/users/${userId}/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  const deleteAddressMutation = useMutation<void, ApiError, string>({
    mutationFn: (addressId) =>
      apiFetch<void>(`/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  const loyaltyQuery = useQuery<LoyaltyInfo, ApiError>({
    queryKey: ['loyalty', userId],
    queryFn: () => apiFetch<LoyaltyInfo>(`/users/${userId}/loyalty`),
    enabled: !!userId,
  });

  return {
    updateProfileMutation,
    addressesQuery,
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
    loyaltyQuery,
  };
}
