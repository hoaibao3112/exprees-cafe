'use client';

import { useFranchisePackagesQuery } from '../../hooks/useFranchiseQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Coffee, Award, ShieldCheck, TrendingUp, Building, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { resolveUploadUrl } from '../../lib/api';
import { OptimizedImage } from '../../components/ui/OptimizedImage';

const MODEL_DETAILS: Record<string, { image: string; title: string }> = {
  'EXPRESS': {
    image: '/media__1780386795847.png',
    title: 'Mô hình quán café'
  },
  'KIOSK': {
    image: '/media__1780386795859.png',
    title: 'Mô hình xe takeaway'
  },
  'PREMIUM': {
    image: '/media__1780386795867.png',
    title: 'Mô hình kiosk tiện lợi'
  }
};

export default function FranchisePage() {
  // Activate scroll animations
  useScrollAnimation();

  const { data: packages, isLoading } = useFranchisePackagesQuery();

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Navigation Header */}
      <Header />

      {/* 2. Dark Breadcrumbs Header */}
      <section 
        className="relative w-full h-[180px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.75)), url('/media__1780386795847.png')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-light text-white uppercase tracking-[0.2em] leading-none" data-animate="blur-in">
            NHƯỢNG QUYỀN
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-350 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-300">Danh mục</span>
            <span className="text-zinc-500">|</span>
            <span className="text-orange-500 font-bold uppercase">NHƯỢNG QUYỀN</span>
          </div>
        </div>
      </section>

      {/* 3. Full-width Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full" data-animate="fade-up">
        <div 
          className="relative w-full h-[240px] rounded-3xl overflow-hidden bg-zinc-950 flex items-center p-8 sm:p-16 border border-zinc-200"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 100%), url('/media__1780386795847.png')`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        >
          <div className="z-10 max-w-lg">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#f07b22]">EXPRESS CAFE</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2 uppercase">
              NHƯỢNG QUYỀN <br />
              <span className="text-[#f07b22]">0 ĐỒNG</span>
            </h2>
          </div>
          
          {/* Mockup 3D Bubble watermark on the right */}
          <div className="absolute right-12 sm:right-20 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-5">
            <div className="text-right">
              <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">HỆ THỐNG</span>
              <span className="block text-4xl font-extrabold text-white mt-1 uppercase tracking-wider leading-none">
                NHƯỢNG QUYỀN <br />
                <span className="text-[#f07b22] text-5xl font-black">0Đ</span>
              </span>
            </div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-[#f07b22] flex items-center justify-center border-[6px] border-white/20 shadow-2xl animate-pulse">
              <span className="text-white text-3xl font-black italic">0đ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 p-4 shadow-sm animate-pulse h-80" />
            ))
          ) : (
            (packages || []).map((pkg, idx) => {
              const details = {
                image: (pkg.images && pkg.images.length > 0) ? resolveUploadUrl(pkg.images[0]) : (MODEL_DETAILS[pkg.modelType]?.image || '/media__1780386795847.png'),
                title: pkg.name,
              };

              return (
                <Link 
                  key={pkg.id}
                  href={`/franchise/${pkg.id}`}
                  data-animate="fade-up"
                  data-delay={String((idx + 1) * 100)}
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-500 cursor-pointer hover:-translate-y-2 flex flex-col justify-end"
                >
                  {/* Image */}
                  <OptimizedImage 
                    src={details.image} 
                    alt={details.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Semi-transparent dark strip at the bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Text inside the dark strip at the bottom left */}
                  <div className="relative z-10 p-6 text-left">
                    <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight tracking-wide">
                      {details.title}
                    </h3>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Floating / Inline Load Button to Trigger Registration Form */}
        <div className="mt-14 text-center">
          <Link
            href="/franchise/register"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#e9762b] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Building className="w-4 h-4" />
            <span>ĐĂNG KÝ HỢP TÁC NHƯỢNG QUYỀN</span>
          </Link>
        </div>
      </section>

      {/* 5. Trust Factors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-zinc-100 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl border border-zinc-200 bg-zinc-50/50 flex items-start gap-4 hover:border-orange-200 transition-all duration-350">
            <TrendingUp className="w-10 h-10 text-emerald-500 shrink-0 bg-emerald-500/10 p-2 rounded-2xl" />
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">ROI cực kỳ hấp dẫn</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                Thời gian hòa vốn trung bình chỉ từ 6 - 12 tháng tùy quy mô gói đầu tư. Tỷ suất lợi nhuận ròng đạt 25% - 30%.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-200 bg-zinc-50/50 flex items-start gap-4 hover:border-orange-200 transition-all duration-350">
            <ShieldCheck className="w-10 h-10 text-orange-500 shrink-0 bg-orange-500/10 p-2 rounded-2xl" />
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Hỗ trợ vận hành SaaS</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                Cung cấp trọn gói phần mềm bán hàng POS, quản lý tồn kho, định vị GPS, khuyến mãi, Loyalty và hỗ trợ Marketing chuỗi.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-200 bg-zinc-50/50 flex items-start gap-4 hover:border-orange-200 transition-all duration-350">
            <Award className="w-10 h-10 text-amber-500 shrink-0 bg-amber-500/10 p-2 rounded-2xl" />
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Thương hiệu uy tín</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                Nguyên liệu cà phê hữu cơ thượng hạng đạt chuẩn XK. Menu đa dạng cập nhật định kỳ theo xu hướng thị trường.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />

    </div>
  );
}
