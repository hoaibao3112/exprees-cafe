import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore, User } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

export function useAuthQueries() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSession, clearSession } = useAuthStore();

  const registerMutation = useMutation<
    { userId: string; email: string; message: string },
    ApiError,
    any
  >({
    mutationFn: (data) =>
      apiFetch<{ userId: string; email: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });

  const verifyOtpMutation = useMutation<
    { success: boolean; message: string },
    ApiError,
    { userId: string; code: string }
  >({
    mutationFn: (data) =>
      apiFetch<{ success: boolean; message: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });

  const loginMutation = useMutation<
    { user: User; accessToken: string },
    ApiError,
    any
  >({
    mutationFn: (data) =>
      apiFetch<{ user: User; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      queryClient.setQueryData(['me'], data.user);
      router.push('/');
    },
  });

  const logoutMutation = useMutation<{ message: string }, ApiError, void>({
    mutationFn: () =>
      apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      router.push('/login');
    },
  });

  const useMeQuery = (enabled = false) =>
    useQuery<User, ApiError>({
      queryKey: ['me'],
      queryFn: async () => {
        const user = await apiFetch<User>('/auth/me');
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          setSession(user, accessToken);
        }
        return user;
      },
      enabled,
    });

  return {
    registerMutation,
    verifyOtpMutation,
    loginMutation,
    logoutMutation,
    useMeQuery,
  };
}
