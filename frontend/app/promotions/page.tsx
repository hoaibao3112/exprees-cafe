'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Coffee,
  ChevronRight,
  MapPin,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Menu as MenuIcon,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { MenuCategory, useMenuQuery } from '../../hooks/useProductsQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { resolveUploadUrl } from '../../lib/api';
import { OptimizedImage } from '../../components/ui/OptimizedImage';

import { useBannersQuery } from '../../hooks/useContentQueries';

const BANNER_IMAGE = '/slideshow_4.jpg';

function formatPrice(value: number | null) {
  if (value === null) {
    return 'Liên hệ';
  }

  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function PromotionsPage() {
  // Activate scroll animations
  useScrollAnimation();

  const { data: menuCategories, isLoading, isError } = useMenuQuery();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const { data: banners = [] } = useBannersQuery();

  const activeBanner = banners.find((b) => b.position === 'PROMOTIONS_HERO');
  const bgImage = activeBanner ? resolveUploadUrl(activeBanner.imageUrl) : BANNER_IMAGE;
  const pageTitle = activeBanner ? activeBanner.title : 'Menu';
  const pageSubtitle = activeBanner ? activeBanner.linkUrl : 'Danh mục sản phẩm được lấy trực tiếp từ backend, trình bày theo bố cục sạch, sáng và dễ chọn món.';
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const categories = useMemo(() => menuCategories || [], [menuCategories]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].slug);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    const sections = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const slug = visible.target.getAttribute('data-category-slug');
        if (slug) {
          setActiveCategory(slug);
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -55% 0px',
        threshold: [0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (category: MenuCategory) => {
    setActiveCategory(category.slug);
    sectionRefs.current[category.slug]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const totalProducts = categories.reduce((sum, category) => sum + category.products.length, 0);

  return (
    <div className="min-h-screen bg-[#fbf7f2] text-zinc-900 flex flex-col">
      <Header />

      <section
        className="relative h-[180px] md:h-[235px] overflow-hidden border-b border-white/40"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(25, 14, 8, 0.74), rgba(25, 14, 8, 0.2)), url(${bgImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl text-white">
            <div data-animate="fade-down" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-300" />
              Express Cafe
            </div>
            <h1 data-animate="blur-in" className="mt-4 text-3xl font-black uppercase tracking-[0.2em] md:text-5xl">{pageTitle}</h1>
            {pageSubtitle && (
              <p data-animate="fade-up" data-delay="200" className="mt-3 max-w-md text-xs font-light text-white/80 md:text-sm">
                {pageSubtitle}
              </p>
            )}
            <div data-animate="fade-up" data-delay="300" className="mt-4 flex items-center gap-2 text-[11px] text-white/70">
              <Link href="/" className="hover:text-orange-300 transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-orange-300">Menu</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[28px] border border-orange-200/80 bg-white/80 backdrop-blur-md p-5 shadow-[0_18px_45px_rgba(210,120,30,0.08)] glass-panel-light">
                <div className="flex min-h-[160px] flex-col items-center justify-center rounded-[24px] border border-orange-200/60 bg-gradient-to-br from-white via-orange-50 to-amber-50 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold uppercase tracking-wider text-orange-500">Danh mục</h2>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                    {totalProducts} sản phẩm từ backend, {categories.length} nhóm danh mục.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  {isLoading ? (
                    <>
                      <div className="h-10 animate-pulse rounded-2xl bg-zinc-100" />
                      <div className="h-10 animate-pulse rounded-2xl bg-zinc-100" />
                      <div className="h-10 animate-pulse rounded-2xl bg-zinc-100" />
                    </>
                  ) : (
                    categories.map((category) => {
                      const active = activeCategory === category.slug;

                      return (
                        <button
                          key={category.id}
                          onClick={() => scrollToCategory(category)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider transition-all ${
                            active
                              ? 'border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-500/15'
                              : 'border-orange-100 bg-white text-zinc-600 hover:border-orange-200 hover:bg-orange-50'
                          }`}
                        >
                          <span>{category.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${
                              active ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-500'
                            }`}
                          >
                            {category.products.length}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-orange-500"
                >
                  <MapPin className="h-4 w-4" />
                  Đặt hàng / Liên hệ
                </Link>
              </div>
            </aside>

            <div className="space-y-8">
              <div className="rounded-[32px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(210,120,30,0.06)] md:p-7">
                <div className="flex flex-col gap-4 border-b border-orange-100 pb-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-orange-500">Menu Express Cafe</p>
                    <h2 className="mt-2 text-xl font-black uppercase tracking-[0.12em] md:text-2xl">Chọn món theo danh mục</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                      Mọi dữ liệu sản phẩm đều lấy từ backend. FE chỉ chịu trách nhiệm trình bày và điều hướng danh mục như trong layout bạn gửi.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                    <div className="rounded-2xl bg-orange-50 px-4 py-3">
                      <div className="text-lg font-black text-orange-500">{categories.length}</div>
                      <div className="mt-1 text-zinc-500">Nhóm</div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-3">
                      <div className="text-lg font-black text-amber-600">{totalProducts}</div>
                      <div className="mt-1 text-zinc-500">Món</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                      <div className="text-lg font-black text-zinc-700">100%</div>
                      <div className="mt-1 text-zinc-500">Backend</div>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-8 pt-6">
                    {[1, 2, 3].map((group) => (
                      <div key={group} className="space-y-4">
                        <div className="mx-auto h-5 w-28 animate-pulse rounded-full bg-zinc-100" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {[1, 2, 3].map((card) => (
                            <div
                              key={card}
                              className="overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-sm"
                            >
                              <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
                              <div className="space-y-2 p-4">
                                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <div className="mt-8 rounded-[24px] border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                    Không tải được menu từ backend. Hãy kiểm tra server NestJS và endpoint <code>/api/v1/products/menu</code>.
                  </div>
                ) : (
                  <div className="space-y-10 pt-6">
                    {categories.map((category) => (
                      <section
                        key={category.id}
                        ref={(node) => {
                          sectionRefs.current[category.slug] = node;
                        }}
                        data-category-slug={category.slug}
                        className="scroll-mt-28"
                      >
                        <div className="section-title-wrapper mb-6 text-center" data-animate="fade-up">
                          <h3 className="text-lg font-black uppercase tracking-wider text-orange-500 md:text-xl inline-block">
                            {category.name}
                          </h3>
                          <div className="section-underline mt-2 mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {category.products.map((product, idx) => (
                            <article
                              key={product.id}
                              data-animate="fade-up"
                              data-delay={String(((idx % 3) + 1) * 150)}
                              className="card-tilt group overflow-hidden rounded-[24px] border border-orange-100 bg-white flex flex-col justify-between"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
                                <OptimizedImage
                                  src={product.imageUrl ? resolveUploadUrl(product.imageUrl) : '/slideshow_2.jpg'}
                                  alt={product.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  fallbackSrc="/slideshow_2.jpg"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
                                {product.isFeatured && (
                                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                                    Nổi bật
                                  </span>
                                )}
                              </div>

                              <div className="p-4 flex flex-col justify-between flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{product.name}</h4>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                                      {product.description || 'Sản phẩm được đồng bộ từ backend.'}
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Giá từ</div>
                                    <div className="mt-1 text-sm font-black text-orange-500">{formatPrice(product.priceFrom)}</div>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-3">
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                    {product.categoryName}
                                  </span>
                                  <Link
                                    href={`/promotions/${product.slug}`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500 transition-colors hover:text-orange-600"
                                  >
                                    Xem chi tiết
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div data-animate="fade-up" data-delay="100" className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <Coffee className="h-7 w-7 text-orange-500" />
                  <h4 className="mt-3 text-sm font-black uppercase tracking-[0.15em]">Tươi mới mỗi ngày</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Menu lấy từ backend nên bạn chỉ cần cập nhật dữ liệu là FE tự hiển thị lại.
                  </p>
                </div>
                <div data-animate="fade-up" data-delay="200" className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <MenuIcon className="h-7 w-7 text-orange-500" />
                  <h4 className="mt-3 text-sm font-black uppercase tracking-[0.15em]">Bố cục đúng ảnh</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Sidebar danh mục bên trái, lưới món bên phải, tông trắng sáng và nhấn cam.
                  </p>
                </div>
                <div data-animate="fade-up" data-delay="300" className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <RefreshCw className="h-7 w-7 text-orange-500" />
                  <h4 className="mt-3 text-sm font-black uppercase tracking-[0.15em]">Dễ mở rộng</h4>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Khi backend thêm món mới, trang này tự nhận dữ liệu mới mà không phải sửa card cứng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
