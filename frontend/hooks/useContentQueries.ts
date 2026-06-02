import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface Article {
  id: string;
  blogHandle: string;
  title: string;
  slug: string;
  contentHtml: string;
  authorId: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
}

export function useArticlesQuery() {
  return useQuery<Article[], ApiError>({
    queryKey: ['articles'],
    queryFn: () => apiFetch<Article[]>('/content/articles'),
  });
}

export function useArticleBySlugQuery(slug: string, enabled = true) {
  return useQuery<Article, ApiError>({
    queryKey: ['articles', slug],
    queryFn: () => apiFetch<Article>(`/content/articles/${slug}`),
    enabled: enabled && !!slug,
  });
}

export function useBannersQuery() {
  return useQuery<Banner[], ApiError>({
    queryKey: ['banners'],
    queryFn: () => apiFetch<Banner[]>('/content/banners'),
  });
}

export function useServicesQuery() {
  return useQuery<Article[], ApiError>({
    queryKey: ['articles', 'services'],
    queryFn: async () => {
      const articles = await apiFetch<Article[]>('/content/articles');
      return articles.filter(a => a.blogHandle === 'services');
    },
  });
}
