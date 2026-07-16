import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ContentService } from '../content/content.service';

type SeedProduct = {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  sortOrder: number;
  isFeatured?: boolean;
};

type MenuProduct = {
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
};

type ProductVariantView = {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
};

type ProductImageView = {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
};

type ProductDetail = {
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
  variants: ProductVariantView[];
  images: ProductImageView[];
  createdAt: Date;
};

type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  products: MenuProduct[];
};

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly contentService: ContentService,
  ) {}

  async onApplicationBootstrap() {
    const productCount = await this.productRepository.count();
    if (productCount > 0) {
      return;
    }

    console.log('🌱 Seeding initial menu categories and products...');

    const categories = await this.seedCategories();
    await this.seedProducts(categories);

    console.log('🌱 Successfully seeded menu categories and products!');
  }

  async findMenu(): Promise<MenuCategory[]> {
    try {
      // 1. Fetch products list from POS API — always use POS when call succeeds (even if empty)
      const res = await this.contentService.posFetch<{ success: boolean; data: any[] }>('GET', '/api/products');
      const posProducts = res?.data || [];

      // 2. Fetch categories from POS API (with SQLite fallback)
      let categories: Category[] = [];
      try {
        const catRes = await this.contentService.posFetch<{ success: boolean; data: any[] }>('GET', '/api/categories', undefined, true);
        const posCategories = catRes?.data || [];
        categories = posCategories.map((c, idx) => {
          const cat = new Category();
          cat.id = c.id;
          cat.name = c.name;
          cat.slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          cat.sortOrder = idx + 1;
          cat.isActive = true;
          return cat;
        });
      } catch (err) {
        console.error('POS /api/categories API unavailable, falling back to local SQLite:', err);
        categories = await this.categoryRepository.find({
          where: { isActive: true },
          order: { sortOrder: 'ASC', name: 'ASC' },
        });
      }

      const categoryMap = new Map<string, Category>(categories.map(c => [c.id, c]));

      // Group POS products by category
      const grouped = new Map<string, MenuCategory>();

      // Initialize groups with categories to preserve sorting order
      for (const cat of categories) {
        grouped.set(cat.id, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
          products: [],
        });
      }

      for (const prod of posProducts) {
        // Find or create category group
        let catId = prod.categoryId || 'other-category';

        // Match by name slug if ID is a custom GUID not in SQLite
        let matchedCat = categoryMap.get(catId);
        if (!matchedCat && prod.categoryName) {
          matchedCat = categories.find(c => c.name.toLowerCase() === prod.categoryName.toLowerCase());
          if (matchedCat) {
            catId = matchedCat.id;
          }
        }

        if (!grouped.has(catId)) {
          const defaultName = prod.categoryName || 'Món Khác';
          const defaultSlug = prod.categoryName ? prod.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'mon-khac';
          grouped.set(catId, {
            id: catId,
            name: defaultName,
            slug: defaultSlug,
            sortOrder: 99,
            products: [],
          });
        }

        const categoryGroup = grouped.get(catId)!;

        // Map POS product structure to frontend MenuProduct format
        categoryGroup.products.push({
          id: prod.id,
          name: prod.name,
          slug: prod.code || prod.id,
          description: prod.description || 'Sản phẩm chính hãng từ Express Cafe.',
          imageUrl: prod.imageUrl || '/slideshow_2.jpg',
          priceFrom: prod.price ? Number(prod.price) : null,
          categoryId: catId,
          categorySlug: categoryGroup.slug,
          categoryName: categoryGroup.name,
          isFeatured: !!prod.isFeatured,
          sortOrder: prod.sortOrder || 0,
        });
      }

      // Return categories sorted by sortOrder (even if all are empty — POS is source of truth)
      return [...grouped.values()]
        .filter((cat) => cat.products.length > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    } catch (err) {
      console.error('POS API unavailable, falling back to local SQLite database:', err);
    }

    // Local DB Fallback (SQLite)
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const products = await this.productRepository.find({
      where: { status: 'ACTIVE' },
      relations: {
        category: true,
        variants: true,
        images: true,
      },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });

    const grouped = new Map<string, MenuCategory>(
      categories.map((category) => [
        category.id,
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
          sortOrder: category.sortOrder,
          products: [],
        },
      ]),
    );

    for (const product of products) {
      const category = grouped.get(product.categoryId);
      if (!category) {
        continue;
      }

      const sortedImages = [...(product.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
      const activeVariants = [...(product.variants || [])]
        .filter((variant) => variant.isActive)
        .sort((a, b) => Number(a.price) - Number(b.price));

      category.products.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? null,
        imageUrl: sortedImages[0]?.url ?? null,
        priceFrom: activeVariants.length > 0 ? Number(activeVariants[0].price) : null,
        categoryId: product.categoryId,
        categorySlug: product.category?.slug ?? '',
        categoryName: product.category?.name ?? category.name,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder,
      });
    }

    return [...grouped.values()].filter((category) => category.products.length > 0);
  }

  async findBySlug(slug: string): Promise<ProductDetail> {
    try {
      // 1. Fetch from POS API — always use POS when call succeeds
      const res = await this.contentService.posFetch<{ success: boolean; data: any[] }>('GET', `/api/products`);
      const posProducts = res?.data || [];
      const prod = posProducts.find((p: any) => p.code === slug || p.id === slug);

      if (prod) {
        return {
          id: prod.id,
          name: prod.name,
          slug: prod.code || prod.id,
          description: prod.description || 'Sản phẩm chính hãng từ Express Cafe.',
          status: 'ACTIVE',
          isFeatured: !!prod.isFeatured,
          sortOrder: prod.sortOrder || 0,
          categoryId: prod.categoryId || 'other',
          categoryName: prod.categoryName || 'Món khác',
          categorySlug: prod.categoryName ? prod.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'other',
          imageUrl: prod.imageUrl || '/slideshow_2.jpg',
          priceFrom: prod.price ? Number(prod.price) : null,
          variants: [
            {
              id: `${prod.id}-default`,
              name: 'Mặc định',
              price: prod.price ? Number(prod.price) : 0,
              stockQuantity: 999,
              sku: `${prod.code || prod.id}-default`,
              isActive: true,
            },
          ],
          images: prod.imageUrl
            ? [
                {
                  id: `${prod.id}-img`,
                  url: prod.imageUrl,
                  sortOrder: 0,
                  isPrimary: true,
                },
              ]
            : [],
          createdAt: new Date(),
        };
      }

      // POS call succeeded but product not found → throw 404, do NOT fall back to SQLite
      throw new NotFoundException(`Product '${slug}' not found`);
    } catch (err) {
      // Only fall back to SQLite if POS is unreachable (network/server error)
      if (err instanceof NotFoundException) throw err;
      console.error('POS API unavailable, falling back to local SQLite database:', err);
    }

    // Local DB Fallback (SQLite)
    const product = await this.productRepository.findOne({
      where: { slug, status: 'ACTIVE' },
      relations: {
        category: true,
        variants: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }

    const sortedImages = [...(product.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const activeVariants = [...(product.variants || [])]
      .filter((variant) => variant.isActive)
      .sort((a, b) => Number(a.price) - Number(b.price));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      status: product.status,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      categoryId: product.categoryId,
      categoryName: product.category?.name ?? '',
      categorySlug: product.category?.slug ?? '',
      imageUrl: sortedImages[0]?.url ?? null,
      priceFrom: activeVariants.length > 0 ? Number(activeVariants[0].price) : null,
      variants: activeVariants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        stockQuantity: variant.stockQuantity,
        sku: variant.sku,
        isActive: variant.isActive,
      })),
      images: sortedImages.map((image) => ({
        id: image.id,
        url: image.url,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
      createdAt: product.createdAt,
    };
  }

  private async seedCategories(): Promise<Map<string, Category>> {
    const seedCategories = [
      { name: 'Cafe', slug: 'cafe', sortOrder: 1 },
      { name: 'Trà', slug: 'tra', sortOrder: 2 },
      { name: 'Trà sữa', slug: 'tra-sua', sortOrder: 3 },
      { name: 'Đá xay', slug: 'da-xay', sortOrder: 4 },
    ];

    const result = new Map<string, Category>();

    for (const seed of seedCategories) {
      const existing = await this.categoryRepository.findOne({ where: { slug: seed.slug } });
      if (existing) {
        Object.assign(existing, seed);
        result.set(seed.slug, await this.categoryRepository.save(existing));
        continue;
      }

      result.set(seed.slug, await this.categoryRepository.save(this.categoryRepository.create({ ...seed, isActive: true })));
    }

    return result;
  }

  private async seedProducts(categories: Map<string, Category>) {
    const menuProducts: SeedProduct[] = [
      { categorySlug: 'cafe', name: 'Cafe Đen', slug: 'cafe-den', description: 'Đậm vị nguyên bản, rang xay chuẩn Express Cafe.', price: 29000, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=900', sortOrder: 1, isFeatured: true },
      { categorySlug: 'cafe', name: 'Cafe Sữa Đá', slug: 'cafe-sua-da', description: 'Ngọt nhẹ, thơm béo, chuẩn gu Việt Nam.', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=900', sortOrder: 2, isFeatured: true },
      { categorySlug: 'cafe', name: 'Cafe Muối', slug: 'cafe-muoi', description: 'Vị mặn dịu cân bằng cùng lớp kem béo mượt.', price: 39000, imageUrl: 'https://images.unsplash.com/photo-1507330281357-2347e77b0e62?auto=format&fit=crop&q=80&w=900', sortOrder: 3 },
      { categorySlug: 'cafe', name: 'Bạc xỉu', slug: 'bac-xiu', description: 'Thanh nhẹ, thơm sữa, dễ uống cho mọi thời điểm.', price: 36000, imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=900', sortOrder: 4 },

      { categorySlug: 'tra', name: 'Trà Xoài Thanh Yên', slug: 'tra-xoai-thanh-yen', description: 'Chua ngọt cân bằng, tươi mát và giàu năng lượng.', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=900', sortOrder: 1, isFeatured: true },
      { categorySlug: 'tra', name: 'Trà Đào Foam Cheese', slug: 'tra-dao-foam-cheese', description: 'Lớp foam cheese béo nhẹ, vị đào thơm mát.', price: 49000, imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=900', sortOrder: 2 },
      { categorySlug: 'tra', name: 'Trà Đào Hạt Chia', slug: 'tra-dao-hat-chia', description: 'Trà trái cây tươi với hạt chia no lâu, đẹp da.', price: 47000, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=900', sortOrder: 3 },
      { categorySlug: 'tra', name: 'Trà Lài Thơm Đào', slug: 'tra-lai-thom-dao', description: 'Hương lài thanh thoát kết hợp vị đào dịu nhẹ.', price: 43000, imageUrl: 'https://images.unsplash.com/photo-1464306076886-da185f6a9d8f?auto=format&fit=crop&q=80&w=900', sortOrder: 4 },

      { categorySlug: 'tra-sua', name: 'Trà Sữa Truyền Thống', slug: 'tra-sua-truyen-thong', description: 'Đậm trà, thơm sữa, topping linh hoạt theo gu.', price: 39000, imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&q=80&w=900', sortOrder: 1, isFeatured: true },
      { categorySlug: 'tra-sua', name: 'Trà Sữa Oolong', slug: 'tra-sua-oolong', description: 'Oolong thơm dịu, hậu vị sâu và thanh.', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=900', sortOrder: 2 },
      { categorySlug: 'tra-sua', name: 'Trà Sữa Matcha', slug: 'tra-sua-matcha', description: 'Béo nhẹ, vị matcha dịu và mùi thơm rõ.', price: 49000, imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&q=80&w=900', sortOrder: 3 },

      { categorySlug: 'da-xay', name: 'Cappuccino Đá Xay', slug: 'cappuccino-da-xay', description: 'Mát lạnh, béo mịn, thích hợp mùa nắng.', price: 52000, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=900', sortOrder: 1, isFeatured: true },
      { categorySlug: 'da-xay', name: 'Mocha Đá Xay', slug: 'mocha-da-xay', description: 'Socola đậm vị hòa quyện cùng cà phê.', price: 55000, imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=900', sortOrder: 2 },
      { categorySlug: 'da-xay', name: 'Caramel Đá Xay', slug: 'caramel-da-xay', description: 'Ngọt dịu, béo thơm, topping kem mịn.', price: 56000, imageUrl: 'https://images.unsplash.com/photo-1432107294469-414527cb5c65?auto=format&fit=crop&q=80&w=900', sortOrder: 3 },
      { categorySlug: 'da-xay', name: 'Matcha Đá Xay', slug: 'matcha-da-xay', description: 'Thanh mát, hương trà xanh nổi bật.', price: 54000, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=900', sortOrder: 4 },
    ];

    for (const seed of menuProducts) {
      const category = categories.get(seed.categorySlug);
      if (!category) {
        continue;
      }

      const existing = await this.productRepository.findOne({ where: { slug: seed.slug } });
      const payload = {
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        status: 'ACTIVE',
        isFeatured: seed.isFeatured ?? false,
        sortOrder: seed.sortOrder,
        categoryId: category.id,
      };

      const product = existing
        ? Object.assign(existing, payload)
        : this.productRepository.create(payload);

      const savedProduct = await this.productRepository.save(product);

      const existingVariant = await this.variantRepository.findOne({
        where: { productId: savedProduct.id, sku: `${seed.slug}-default` },
      });

      const variant = existingVariant
        ? Object.assign(existingVariant, {
            name: 'Mặc định',
            price: seed.price,
            stockQuantity: 999,
            isActive: true,
          })
        : this.variantRepository.create({
            name: 'Mặc định',
            price: seed.price,
            stockQuantity: 999,
            sku: `${seed.slug}-default`,
            isActive: true,
            productId: savedProduct.id,
          });

      await this.variantRepository.save(variant);

      const existingImage = await this.imageRepository.findOne({
        where: { productId: savedProduct.id, isPrimary: true },
      });

      const image = existingImage
        ? Object.assign(existingImage, {
            url: seed.imageUrl,
            sortOrder: 0,
            isPrimary: true,
          })
        : this.imageRepository.create({
            url: seed.imageUrl,
            sortOrder: 0,
            isPrimary: true,
            productId: savedProduct.id,
          });

      await this.imageRepository.save(image);
    }
  }
}
