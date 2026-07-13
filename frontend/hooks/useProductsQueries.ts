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

const MOCK_MENU: MenuCategory[] = [
  {
    id: 'cat-1',
    name: 'Cà phê pha máy',
    slug: 'ca-phe-pha-may',
    sortOrder: 1,
    products: [
      {
        id: 'prod-1',
        name: 'Cà phê Espresso',
        slug: 'ca-phe-espresso',
        description: 'Đậm vị, hương thơm nồng nàn từ hạt Robusta rang mộc chuẩn gu.',
        imageUrl: '/media__1780386795847.png',
        priceFrom: 29000,
        categoryId: 'cat-1',
        categorySlug: 'ca-phe-pha-may',
        categoryName: 'Cà phê pha máy',
        isFeatured: true,
        sortOrder: 1
      },
      {
        id: 'prod-2',
        name: 'Cà phê Cappuccino',
        slug: 'ca-phe-cappuccino',
        description: 'Vị béo ngậy của sữa tươi hòa quyện cùng Espresso thượng hạng.',
        imageUrl: '/media__1780386795859.png',
        priceFrom: 39000,
        categoryId: 'cat-1',
        categorySlug: 'ca-phe-pha-may',
        categoryName: 'Cà phê pha máy',
        isFeatured: false,
        sortOrder: 2
      },
      {
        id: 'prod-3',
        name: 'Cà phê Latte',
        slug: 'ca-phe-latte',
        description: 'Êm dịu, nhẹ nhàng với lớp bọt sữa vẽ nghệ thuật bắt mắt.',
        imageUrl: '/media__1780386795867.png',
        priceFrom: 39000,
        categoryId: 'cat-1',
        categorySlug: 'ca-phe-pha-may',
        categoryName: 'Cà phê pha máy',
        isFeatured: false,
        sortOrder: 3
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Cà phê truyền thống',
    slug: 'ca-phe-truyen-thong',
    sortOrder: 2,
    products: [
      {
        id: 'prod-4',
        name: 'Cà phê Đen Đá',
        slug: 'ca-phe-den-da',
        description: 'Hương vị mạnh mẽ, đậm đà truyền thống từ hạt cà phê sạch Đắk Lắk.',
        imageUrl: '/media__1780385270571.png',
        priceFrom: 22000,
        categoryId: 'cat-2',
        categorySlug: 'ca-phe-truyen-thong',
        categoryName: 'Cà phê truyền thống',
        isFeatured: true,
        sortOrder: 1
      },
      {
        id: 'prod-5',
        name: 'Cà phê Sữa Đá',
        slug: 'ca-phe-sua-da',
        description: 'Sự kết hợp hoàn hảo giữa sữa đặc béo ngậy và cốt cà phê Robusta đậm vị.',
        imageUrl: '/media__1780385290773.png',
        priceFrom: 25000,
        categoryId: 'cat-2',
        categorySlug: 'ca-phe-truyen-thong',
        categoryName: 'Cà phê truyền thống',
        isFeatured: true,
        sortOrder: 2
      }
    ]
  }
];

export function useMenuQuery() {
  return useQuery<MenuCategory[], ApiError>({
    queryKey: ['menu'],
    queryFn: async () => {
      try {
        const data = await apiFetch<MenuCategory[]>('/products/menu');
        return data && data.length > 0 ? data : MOCK_MENU;
      } catch (err) {
        console.warn('API /products/menu offline, falling back to mock menu:', err);
        return MOCK_MENU;
      }
    },
  });
}

export function useProductDetailQuery(slug: string, enabled = true) {
  return useQuery<ProductDetail, ApiError>({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        return await apiFetch<ProductDetail>(`/products/${slug}`);
      } catch (err) {
        console.warn(`API /products/${slug} offline, falling back to mock product:`, err);
        const allProducts: MenuProduct[] = [];
        MOCK_MENU.forEach(cat => allProducts.push(...cat.products));
        const found = allProducts.find(p => p.slug === slug) || allProducts[0];
        return {
          id: found.id,
          name: found.name,
          slug: found.slug,
          description: found.description,
          status: 'ACTIVE',
          isFeatured: found.isFeatured,
          sortOrder: found.sortOrder,
          categoryId: found.categoryId,
          categoryName: found.categoryName,
          categorySlug: found.categorySlug,
          imageUrl: found.imageUrl,
          priceFrom: found.priceFrom,
          variants: [
            { id: 'v-1', name: 'Size S (Tiêu chuẩn)', price: found.priceFrom || 29000, stockQuantity: 100, sku: 'LATTE-S', isActive: true },
            { id: 'v-2', name: 'Size M (Lớn)', price: (found.priceFrom || 29000) + 6000, stockQuantity: 100, sku: 'LATTE-M', isActive: true }
          ],
          images: found.imageUrl ? [
            { id: 'img-1', url: found.imageUrl, sortOrder: 1, isPrimary: true },
            { id: 'img-2', url: '/media__1780386795859.png', sortOrder: 2, isPrimary: false },
            { id: 'img-3', url: '/media__1780386795867.png', sortOrder: 3, isPrimary: false }
          ] : [],
          createdAt: new Date().toISOString()
        };
      }
    },
    enabled: enabled && !!slug,
  });
}
