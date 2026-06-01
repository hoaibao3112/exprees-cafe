import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface ValidateCouponPayload {
  code: string;
  subtotal: number;
  userId?: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  couponId: string;
  code: string;
  discountApplied: number;
  message: string;
}

export function useValidateCouponMutation() {
  return useMutation<ValidateCouponResponse, ApiError, ValidateCouponPayload>({
    mutationFn: (data) =>
      apiFetch<ValidateCouponResponse>('/promotions/validate-coupon', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
