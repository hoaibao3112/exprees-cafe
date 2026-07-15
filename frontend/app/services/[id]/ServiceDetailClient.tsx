'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { resolveUploadUrl } from '../../../lib/api';
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Coffee, CheckCircle2, Phone, ArrowRight,
  MapPin, Clock, Star
} from 'lucide-react';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';
import { useServiceByIdQuery } from '../../../hooks/useServicesQueries';

interface ServiceDetailClientProps {
  id: string;
}

export default function ServiceDetailClient({ id }: ServiceDetailClientProps) {
  useScrollAnimation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: service, isLoading } = useServiceByIdQuery(id);

  /* ─── Loading skeleton ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="animate-pulse flex-1">
          <div className="w-full h-[45vh] bg-zinc-200" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-6 bg-zinc-200 rounded w-1/3" />
              <div className="h-40 bg-zinc-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-48 bg-zinc-200 rounded-2xl" />
              <div className="h-32 bg-zinc-200 rounded-2xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không tìm thấy dịch vụ</p>
          <Link href="/services" className="text-orange-500 hover:underline">
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const serviceImages = service.images && service.images.length > 0
    ? service.images.map((img: string) => resolveUploadUrl(img))
    : (service.imageUrl
      ? [resolveUploadUrl(service.imageUrl)]
      : ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200']);

  const handlePrev = () =>
    setCurrentImageIndex((p) => (p === 0 ? serviceImages.length - 1 : p - 1));
  const handleNext = () =>
    setCurrentImageIndex((p) => (p === serviceImages.length - 1 ? 0 : p + 1));

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-800 font-sans">
      <Header />

      {/* ══════════════════════════════════════
          HERO — Full-width image + overlay (Adjusted to avoid cutting off images)
      ══════════════════════════════════════ */}
      <div className="relative w-full h-[60vh] md:h-[65vh] min-h-[460px] md:min-h-[520px] bg-zinc-950 overflow-hidden flex items-center justify-center">
        {/* Background image - Blurred and stretched */}
        <OptimizedImage
          src={serviceImages[currentImageIndex]}
          alt=""
          fill
          sizes="100vw"
          className="object-cover blur-2xl scale-110 opacity-40 select-none pointer-events-none"
          priority
        />

        {/* Foreground image - Fixed aspect ratio and object-cover to make it wider */}
        <div className="relative z-10 w-full h-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center pb-12 pt-6 md:pb-16 md:pt-8">
          <div className="relative w-full max-w-2xl md:max-w-3xl aspect-[1.4] md:aspect-[1.5] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={serviceImages[currentImageIndex]}
              alt={service.name}
              className="w-full h-full object-cover object-[center_15%] transition-all duration-300"
            />
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/40 to-black/45 pointer-events-none" />

        {/* Breadcrumb top-left */}
        <div className="absolute top-5 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại danh sách dịch vụ
          </Link>
        </div>

        {/* Service name bottom-left */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-20">
          <span data-animate="fade-down" className="inline-block px-3 py-1 bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-md mb-3">
            Dịch vụ F&B
          </span>
          <h1 data-animate="blur-in" data-delay="150" className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent pb-1">
            {service.name}
          </h1>
        </div>

        {/* Gallery nav arrows */}
        {serviceImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center transition-all text-white z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center transition-all text-white z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute top-5 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20">
              {currentImageIndex + 1}/{serviceImages.length}
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════
          THUMBNAIL STRIP
      ══════════════════════════════════════ */}
      {serviceImages.length > 1 && (
        <div className="bg-white border-b border-zinc-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 -mb-4">
            {serviceImages.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                  idx === currentImageIndex
                    ? 'ring-2 ring-orange-500 ring-offset-1 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <OptimizedImage
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
            <span className="text-[10px] text-zinc-400 font-medium ml-1">
              {serviceImages.length} ảnh
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN: Description ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100">
                <Coffee className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-bold text-zinc-800">Mô tả dịch vụ</h2>
              </div>
              <div className="px-6 py-5">
                {service.description ? (
                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                ) : (
                  <p className="text-zinc-400 text-sm italic">Chưa có mô tả cho dịch vụ này.</p>
                )}
              </div>
            </div>

            {/* Why choose us — 3 highlight chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Star,   text: 'Chất lượng đảm bảo',  sub: 'Tiêu chuẩn F&B cao cấp' },
                { icon: Clock,  text: 'Hỗ trợ 24/7',         sub: 'Luôn sẵn sàng tư vấn'    },
                { icon: MapPin, text: 'Phủ khắp TP.HCM',     sub: 'Phục vụ tận nơi'         },
              ].map(({ icon: Icon, text, sub }) => (
                <div
                  key={text}
                  className="bg-white rounded-xl border border-zinc-100 p-3 md:p-4 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800">{text}</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <a
              href="https://c439f6n0z9h.sg.larksuite.com/share/base/form/shrlgCqbXhTIu8D7489D9Unc2Bc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Đăng ký tư vấn dịch vụ
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* ── RIGHT COLUMN: Sticky Sidebar ── */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">

            {/* Hotline card */}
            <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20">
              {/* decorative circle */}
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />

              <div className="relative p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
                    Hotline tư vấn trực tiếp
                  </p>
                  <a
                    href="tel:0362077399"
                    className="text-3xl font-black text-white hover:text-orange-100 transition-colors tracking-wide block mt-1"
                  >
                    0362 077 399
                  </a>
                  <p className="text-orange-100/80 text-xs font-medium mt-1 leading-relaxed">
                    Hỗ trợ 24/7 — Tư vấn miễn phí ngay hôm nay
                  </p>
                </div>

                <Link
                  href="/franchise/register?packageId=2b84cdea-bd8e-49f2-8544-01fcaf58bb3e"
                  className="w-full mt-1 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Gửi yêu cầu tư vấn online
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Benefits card */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-zinc-800">Quyền lợi khi sử dụng</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  'Hỗ trợ tư vấn chuyên nghiệp 24/7',
                  'Giá cả cạnh tranh và minh bạch',
                  'Chất lượng dịch vụ đảm bảo',
                  'Bảo hành và hỗ trợ sau dịch vụ',
                  'Đội ngũ kỹ thuật viên có kinh nghiệm',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-orange-500" />
                    </div>
                    <span className="text-sm text-zinc-600 font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to services link */}
            <Link
              href="/services"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-orange-200 hover:border-orange-400 text-orange-500 hover:text-orange-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Xem tất cả dịch vụ
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
