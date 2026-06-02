import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';

export interface MenuProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  priceFrom: number | null;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string | null;
  priceFrom: number | null;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  products: MenuProduct[];
}

export function useMenuQuery() {
  return useQuery<MenuCategory[], ApiError>({
    queryKey: ['menu'],
    queryFn: () => apiFetch<MenuCategory[]>('/products/menu'),
  });
}

export function useProductDetailQuery(slug: string, enabled = true) {
  return useQuery<ProductDetail, ApiError>({
    queryKey: ['product', slug],
    queryFn: () => apiFetch<ProductDetail>(`/products/${slug}`),
    enabled: enabled && !!slug,
  });
}
