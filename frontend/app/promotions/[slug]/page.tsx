'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Coffee,
  Image as ImageIcon,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { useProductDetailQuery } from '../../../hooks/useProductsQueries';
import { resolveUploadUrl } from '../../../lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(value: number | null) {
  if (value === null) return 'Liên hệ';
  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function ProductDetailPage(props: PageProps) {
  const resolvedParams = React.use(props.params);
  const { slug } = resolvedParams as { slug: string };
  const { data: product, isLoading, error } = useProductDetailQuery(slug);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  const images = product?.images?.length
    ? product.images.map((img: any) => ({ ...img, url: resolveUploadUrl(img.url) }))
    : product?.imageUrl
      ? [{ id: product.id, url: resolveUploadUrl(product.imageUrl), sortOrder: 0, isPrimary: true }]
      : [];

  const activeImage = images[activeImageIndex] ?? images[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf7f2] text-zinc-900 flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-medium text-zinc-500">Đang tải chi tiết sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fbf7f2] text-zinc-900 flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <div className="max-w-md rounded-[28px] border border-orange-100 bg-white p-8 shadow-[0_18px_45px_rgba(210,120,30,0.06)]">
            <ShoppingBag className="mx-auto h-12 w-12 text-orange-500" />
            <h1 className="mt-4 text-2xl font-black uppercase tracking-[0.12em]">Không tìm thấy sản phẩm</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Có thể sản phẩm đã bị xóa, không còn hoạt động, hoặc đường dẫn slug chưa đúng.
            </p>
            <Link
              href="/promotions"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-orange-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại menu
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const salePrice = product.priceFrom;

  return (
    <div className="min-h-screen bg-[#fbf7f2] text-zinc-900 flex flex-col">
      <Header />

      <section
        className="relative overflow-hidden border-b border-white/40"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(25, 14, 8, 0.88), rgba(25, 14, 8, 0.58)), url(/slideshow_4.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition-all hover:bg-white/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại menu
          </Link>

          <div className="mt-5 flex max-w-2xl items-center gap-2 text-white/70">
            <Link href="/" className="hover:text-orange-300 transition-colors">
              Trang chủ
            </Link>
            <ArrowRight className="h-3 w-3" />
            <Link href="/promotions" className="hover:text-orange-300 transition-colors">
              Menu
            </Link>
            <ArrowRight className="h-3 w-3" />
            <span className="text-orange-300">{product.name}</span>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                {product.categoryName}
              </div>
              <h1 className="max-w-3xl text-3xl font-black uppercase tracking-[0.12em] text-white md:text-5xl">
                {product.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                {product.description || 'Thông tin sản phẩm được lấy trực tiếp từ backend.'}
              </p>

              <div className="flex flex-wrap gap-3 text-[11px] text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  <Coffee className="h-3.5 w-3.5 text-orange-300" />
                  Giá từ {formatPrice(salePrice)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  <CalendarDays className="h-3.5 w-3.5 text-orange-300" />
                  Cập nhật từ backend
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-2xl shadow-black/10">
              <div className="overflow-hidden rounded-[22px] bg-black/15">
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={product.name}
                    className="h-[320px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-white/60">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                        activeImageIndex === index
                          ? 'border-orange-300 ring-2 ring-orange-300/50'
                          : 'border-white/15 opacity-80'
                      }`}
                    >
                      <img src={image.url} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(210,120,30,0.06)] md:p-7">
                <h2 className="text-lg font-black uppercase tracking-[0.16em] text-orange-500">Mô tả sản phẩm</h2>
                <p className="mt-4 text-sm leading-8 text-zinc-600">
                  {product.description || 'Sản phẩm này chưa có mô tả chi tiết từ backend.'}
                </p>
              </div>

              <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(210,120,30,0.06)] md:p-7">
                <h2 className="text-lg font-black uppercase tracking-[0.16em] text-orange-500">Tùy chọn giá</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded-[22px] border border-orange-100 bg-orange-50/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">{variant.name}</h3>
                          <p className="mt-1 text-[11px] text-zinc-500">SKU: {variant.sku}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            {variant.isActive ? 'Đang bán' : 'Ẩn'}
                          </div>
                          <div className="mt-1 text-sm font-black text-orange-500">
                            {formatPrice(variant.price)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px] text-zinc-500">
                        Tồn kho: {variant.stockQuantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(210,120,30,0.06)] md:p-7">
                <h2 className="text-lg font-black uppercase tracking-[0.16em] text-orange-500">Hình ảnh</h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`overflow-hidden rounded-[20px] border transition-all ${
                        activeImageIndex === index
                          ? 'border-orange-400 ring-2 ring-orange-300/40'
                          : 'border-orange-100'
                      }`}
                    >
                      <img src={image.url} alt={product.name} className="h-36 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(210,120,30,0.06)]">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">Thông tin nhanh</h2>
                <div className="mt-4 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-center justify-between gap-4 border-b border-orange-100 pb-2">
                    <span>Danh mục</span>
                    <span className="font-semibold text-zinc-900">{product.categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-orange-100 pb-2">
                    <span>Slug</span>
                    <span className="font-semibold text-zinc-900">{product.slug}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-orange-100 pb-2">
                    <span>Giá từ</span>
                    <span className="font-semibold text-orange-500">{formatPrice(product.priceFrom)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Trạng thái</span>
                    <span className="font-semibold text-emerald-600">Đang hoạt động</span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-orange-600"
                >
                  Đặt hàng / Tư vấn
                </Link>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(210,120,30,0.06)]">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">Quay lại menu</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  Bạn có thể xem thêm các sản phẩm khác trong cùng danh mục hoặc chuyển về danh sách tổng.
                </p>
                <Link
                  href="/promotions"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-500 transition-all hover:bg-orange-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Về danh sách menu
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
