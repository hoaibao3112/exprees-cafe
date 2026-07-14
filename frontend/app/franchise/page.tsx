'use client';

import { useBannersQuery } from '../../hooks/useContentQueries';
import { useFranchisePackagesQuery } from '../../hooks/useFranchiseQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Coffee, Award, ShieldCheck, TrendingUp, Building, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { resolveUploadUrl } from '../../lib/api';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

const MODEL_DETAILS: Record<string, { image: string; title: string; desc: string }> = {
  'EXPRESS': {
    image: '/media__1780386795847.png',
    title: 'Mô hình xe đẩy Express',
    desc: 'Linh hoạt, chi phí thấp, tối ưu diện tích mặt bằng nhỏ.'
  },
  'KIOSK': {
    image: '/slideshow_3.jpg',
    title: 'Mô hình Kiosk Cafe',
    desc: 'Mô hình bán lẻ chuyên nghiệp, tập trung lượng khách hàng trung tâm.'
  },
  'STORE': {
    image: '/slideshow_1.jpg',
    title: 'Mô hình Cửa hàng Store',
    desc: 'Mô hình cửa hàng đầy đủ dịch vụ trải nghiệm, phục vụ lượng khách đông đảo.'
  }
};

export default function FranchisePage() {
  // Activate scroll animations
  useScrollAnimation();

  const { data: packages, isLoading } = useFranchisePackagesQuery();
  const { data: banners = [] } = useBannersQuery();

  const activeBanner = banners.find((b) => b.position === 'FRANCHISE_HERO');
  const bgImage = activeBanner ? resolveUploadUrl(activeBanner.imageUrl) : '/slideshow_4.jpg';
  const pageTitle = activeBanner ? activeBanner.title : 'Nhượng Quyền Thương Hiệu';
  const pageSubtitle = activeBanner ? activeBanner.linkUrl : 'Hợp Tác Cùng Phát Triển';

  const renderTitle = () => {
    const words = pageTitle.split(' ');
    if (words.length <= 1) return <span className="text-white">{pageTitle}</span>;
    // Split franchise page title cleanly in half
    const splitIndex = Math.ceil(words.length / 2);
    const whiteText = words.slice(0, splitIndex).join(' ');
    const orangeText = words.slice(splitIndex).join(' ');
    return (
      <>
        <span className="text-white">{whiteText} </span>
        <span className="text-[#f07b22]">{orangeText}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Navigation Header */}
      <Header />

      {/* 2. Enhanced Hero Section */}
      <section 
        className="relative w-full h-[320px] md:h-[420px] bg-zinc-950 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.6)), url(${bgImage})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          {pageSubtitle && (
            <span 
              className="inline-block text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-orange-400 mb-3 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20"
              data-animate="fade-down"
            >
              {pageSubtitle}
            </span>
          )}
          
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider leading-tight drop-shadow-md" data-animate="blur-in">
            {renderTitle()}
          </h1>
          
          <div className="w-16 h-1 bg-orange-500 mx-auto my-4 rounded-full" data-animate="scale-up" data-delay="200" />
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs md:text-sm font-medium mt-4 bg-black/35 backdrop-blur-md py-2 px-5 rounded-full w-max mx-auto shadow-sm" data-animate="fade-up" data-delay="300">
            <Link href="/" className="hover:text-orange-400 transition-colors">Trang chủ</Link>
            <span className="text-zinc-650">|</span>
            <span className="text-zinc-400">Danh mục</span>
            <span className="text-zinc-650">|</span>
            <span className="text-orange-400 font-bold uppercase">Nhượng Quyền</span>
          </div>
        </div>
      </section>

      {/* 3. Redesigned Full-width Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full" data-animate="fade-up">
        <div 
          className="relative w-full h-[280px] md:h-[360px] rounded-3xl overflow-hidden bg-zinc-950 flex items-center p-8 sm:p-20 border border-zinc-800 shadow-2xl hover:shadow-orange-500/5 transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.2) 100%), url('/slideshow_2.jpg')`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        >
          <div className="z-10 max-w-lg">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#f07b22] bg-[#f07b22]/10 px-3 py-1 rounded-md border border-[#f07b22]/20">Hệ Thống Đặc Quyền</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 uppercase leading-none">
              NHƯỢNG QUYỀN <br />
              <span className="text-[#f07b22] drop-shadow-md">0 ĐỒNG</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-4 leading-relaxed font-light hidden sm:block">
              Cơ hội đồng hành cùng thương hiệu cà phê hữu cơ hàng đầu, giảm thiểu tối đa chi phí nhượng quyền ban đầu, tối ưu hiệu quả lợi nhuận.
            </p>
            
            <Link 
              href="/franchise/register"
              className="mt-6 inline-flex items-center gap-2 bg-[#f07b22] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/10 hover:scale-105 active:scale-95"
            >
              <span>Liên hệ ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {/* Mockup 3D Bubble watermark on the right */}
          <div className="absolute right-12 sm:right-24 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-6 z-10 animate-float">
            <div className="text-right">
              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">ĐẶC BIỆT</span>
              <span className="block text-4xl font-extrabold text-white mt-1 uppercase tracking-wider leading-none">
                ĐẦU TƯ <br />
                <span className="text-[#f07b22] text-5xl font-black drop-shadow-md">0Đ</span>
              </span>
            </div>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-[#f07b22] flex items-center justify-center border-[8px] border-white/10 shadow-2xl relative">
              <span className="text-white text-3xl font-black italic select-none">0đ</span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Optimized Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Section Header */}
        <div className="text-center mb-14" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-1.5 rounded-full border border-[#f07b22]/20">
            Danh sách gói đầu tư
          </span>
          <div className="section-title-wrapper mt-4">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight inline-block">
              Các Mô Hình Nhượng Quyền
            </h2>
            <div className="section-underline mt-2 mx-auto" />
          </div>
          <p className="mt-4 text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Linh hoạt lựa chọn mô hình phù hợp với nguồn vốn và không gian — Express Cafe đồng hành trọn gói từ A đến Z.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100 shadow-sm animate-pulse h-[460px]" />
            ))
          ) : (
            (packages || []).map((pkg, idx) => {
              const details = {
                image: (pkg.images && pkg.images.length > 0) ? resolveUploadUrl(pkg.images[0]) : (MODEL_DETAILS[pkg.modelType]?.image || '/media__1780386795847.png'),
                title: pkg.name,
                desc: pkg.description || MODEL_DETAILS[pkg.modelType]?.desc || 'Mô hình nhượng quyền chuyên nghiệp và hiệu quả từ Express Cafe.'
              };

              const modelBadge: Record<string, string> = {
                EXPRESS: 'Quán Café',
                KIOSK: 'Xe Take Away',
                PREMIUM: 'Kiosk Tiện Lợi',
              };

              const modelIcon: Record<string, string> = {
                EXPRESS: '🏠',
                KIOSK: '🚐',
                PREMIUM: '🏬',
              };

              return (
                <div
                  key={pkg.id}
                  data-animate="fade-up"
                  data-delay={String((idx + 1) * 150)}
                  className="group relative bg-white rounded-[28px] overflow-hidden border border-zinc-100 shadow-md hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-500 flex flex-col hover:-translate-y-3"
                >
                  {/* Image Container */}
                  <div className="relative h-[260px] w-full overflow-hidden bg-zinc-100 shrink-0">
                    <OptimizedImage
                      src={details.image}
                      alt={details.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      style={{ transform: 'scale(1)', transition: 'transform 700ms ease-out' }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 800ms ease, opacity 400ms ease' }} />

                    {/* Model Type Badge - top left */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <span>{modelIcon[pkg.modelType] ?? '☕'}</span>
                        {modelBadge[pkg.modelType] ?? pkg.modelType}
                      </span>
                    </div>

                    {/* Investment badge - top right */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold border border-white/20">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        Trọn gói
                      </span>
                    </div>

                    {/* Title overlay at bottom of image */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-xl font-black text-white leading-tight drop-shadow-md group-hover:text-orange-300 transition-colors duration-300">
                        {details.title}
                      </h3>
                    </div>
                  </div>

                  {/* Info Content Area */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {details.desc}
                    </p>

                    <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-[#f07b22] uppercase tracking-wider flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5" />
                        Hỗ trợ trọn gói
                      </span>
                      <Link
                        href={`/franchise/${pkg.id}`}
                        className="spotlight-wrapper inline-flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-orange-500/20"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-14 text-center" data-animate="fade-up">
          <Link
            href="/franchise/register"
            className="spotlight-wrapper inline-flex items-center gap-2.5 px-10 py-4 bg-[#e9762b] hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95"
          >
            <Building className="w-4 h-4" />
            <span>Đăng ký hợp tác nhượng quyền</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Trust Factors Section with counter animations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-250/60 w-full" data-animate="fade-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-zinc-150 bg-white hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-12 h-12 text-emerald-500 shrink-0 bg-emerald-500/10 p-2.5 rounded-2xl" />
              <div>
                <h3 className="font-bold text-zinc-900 text-base">ROI cực kỳ hấp dẫn</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                  Thời gian hòa vốn trung bình nhanh chóng, tối ưu hóa điểm dòng tiền và lợi nhuận.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-100 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-500 tracking-tight">
                <AnimatedCounter end={6} suffix="" /> - <AnimatedCounter end={12} suffix="" />
              </span>
              <span className="text-xs text-zinc-400 font-semibold uppercase">Tháng hòa vốn</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-150 bg-white hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-12 h-12 text-orange-500 shrink-0 bg-orange-500/10 p-2.5 rounded-2xl" />
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Công nghệ thông minh</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                  Phần mềm bán hàng, quản lý kho tự động và hệ thống báo cáo SaaS chuẩn hóa toàn chuỗi.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-100 flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-500 tracking-tight">
                <AnimatedCounter end={100} suffix="%" />
              </span>
              <span className="text-xs text-zinc-400 font-semibold uppercase">Bảo trợ vận hành</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-150 bg-white hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <Award className="w-12 h-12 text-amber-500 shrink-0 bg-amber-500/10 p-2.5 rounded-2xl" />
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Thương hiệu uy tín</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-light">
                  Nguyên liệu cà phê hữu cơ sạch đạt chuẩn cao cùng menu cập nhật theo xu hướng thường xuyên.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-100 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-500 tracking-tight">
                <AnimatedCounter end={30} suffix="%" />
              </span>
              <span className="text-xs text-zinc-400 font-semibold uppercase">Lợi nhuận ròng</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />

    </div>
  );
}
