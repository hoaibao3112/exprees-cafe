import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface UserReview {
  id: string;
  userId: string;
  orderId?: string;
  targetType: string; // PRODUCT, BRANCH
  targetId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  starDistribution: Record<number, number>;
}

export interface ReviewResponse {
  reviews: UserReview[];
  stats: ReviewStats;
}

export interface SubmitReviewPayload {
  targetType: string; // PRODUCT, BRANCH
  targetId: string;
  rating: number;
  comment: string;
}

export function useReviewsQuery(targetType: string, targetId: string) {
  return useQuery<ReviewResponse, ApiError>({
    queryKey: ['reviews', targetType, targetId],
    queryFn: () => apiFetch<ReviewResponse>(`/reviews/${targetType}/${targetId}`),
    enabled: !!targetType && !!targetId,
  });
}

export function usePostReviewMutation(targetType: string, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation<UserReview, ApiError, SubmitReviewPayload>({
    mutationFn: (data) =>
      apiFetch<UserReview>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate target reviews to refresh stats
      queryClient.invalidateQueries({ queryKey: ['reviews', targetType, targetId] });
    },
  });
}
