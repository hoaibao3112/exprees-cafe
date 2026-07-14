'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { useBannersQuery } from '@/hooks/useContentQueries';
import { resolveUploadUrl } from '@/lib/api';

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=70&w=1000&auto=format&fit=crop',
    alt: 'Dịch vụ cho thuê máy cà phê',
    titleWhite: 'CHO THUÊ',
    titleOrange: 'MÁY PHA CÀ PHÊ',
    subtitle: 'Giải pháp chuyên nghiệp cho văn phòng, nhà hàng và chuỗi kinh doanh F&B'
  },
  {
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=70&w=1000&auto=format&fit=crop',
    alt: 'Nhượng quyền 0 đồng - Mô hình ki-ốt',
    titleWhite: 'NHƯỢNG QUYỀN',
    titleOrange: 'THƯƠNG HIỆU 0Đ',
    subtitle: 'Hỗ trợ khởi nghiệp trọn gói, tối ưu hóa lợi nhuận, thời gian hoàn vốn cực nhanh'
  },
  {
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=70&w=1000&auto=format&fit=crop',
    alt: 'Thưởng thức cà phê sạch nguyên chất',
    titleWhite: 'HƯƠNG VỊ',
    titleOrange: 'NGUYÊN BẢN ĐÍNH THỰC',
    subtitle: 'Nguồn cà phê sạch hữu cơ 100% Robusta & Arabica từ nông trại Đắk Lắk'
  },
  {
    url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=70&w=1000&auto=format&fit=crop',
    alt: 'Hệ thống nhượng quyền Express Cafe',
    titleWhite: 'VẬN HÀNH',
    titleOrange: 'SAAS THÔNG MINH',
    subtitle: 'Quản trị chuỗi tự động từ xa với phần mềm POS & GPS hiện đại dẫn đầu xu thế'
  }
];

const resolveLocalOrUpload = (url?: string | null) => {
  if (!url) return '';
  let normalizedUrl = url;
  if (url.startsWith('http://localhost:3000/')) {
    normalizedUrl = url.substring('http://localhost:3000/'.length);
  }
  if (normalizedUrl.startsWith('uploads/') || normalizedUrl.startsWith('/uploads/')) {
    return resolveUploadUrl(normalizedUrl.startsWith('/') ? normalizedUrl.slice(1) : normalizedUrl);
  }
  if (normalizedUrl.startsWith('/') || normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
    return normalizedUrl;
  }
  return resolveUploadUrl(normalizedUrl);
};

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: dbBanners = [] } = useBannersQuery();

  const slides = dbBanners.length > 0 ? dbBanners.map(b => {
    const titleWords = b.title.split(' ');
    return {
      url: resolveLocalOrUpload(b.imageUrl),
      alt: b.title,
      titleWhite: titleWords[0] || '',
      titleOrange: titleWords.slice(1).join(' ') || '',
      subtitle: b.title.includes('Cold Brew') 
        ? 'Thưởng thức hương vị cà phê ủ lạnh mộc mạc thanh mát' 
        : 'Hương vị truyền thống kết hợp công nghệ hiện đại cùng Express Cafe',
      ctaLink: b.linkUrl || '/franchise/register'
    };
  }) : SLIDES.map(s => ({
    url: s.url,
    alt: s.alt,
    titleWhite: s.titleWhite,
    titleOrange: s.titleOrange,
    subtitle: s.subtitle,
    ctaLink: '/franchise/register'
  }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[620px] bg-zinc-950 overflow-hidden group/slideshow">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className={`object-cover transition-transform duration-[8000ms] ${idx === activeSlide ? 'scale-110' : 'scale-100'}`}
            />
          </div>
          {/* Enhanced Multi-layer Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Premium Glassmorphic content layout */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-3xl space-y-4">
              {/* Glassmorphic Badge */}
              <div className={`transition-all duration-700 delay-300 transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <span className="starburst-wrapper inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/40 px-5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-400 backdrop-blur-md shadow-lg shadow-orange-950/20">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" /> MỸ THUẬT RANG XAY & CÔNG NGHỆ SAAS
                </span>
              </div>

              {/* Responsive Title with glowing text shadow */}
              <h1 className={`text-2xl sm:text-4xl md:text-6xl font-black uppercase leading-none drop-shadow-2xl tracking-wide transition-all duration-700 delay-500 transform ${
                idx === activeSlide ? 'translate-y-0 opacity-100 animate-ink-bleed' : 'translate-y-4 opacity-0'
              }`}>
                <span className="text-white block sm:inline drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{slide.titleWhite} </span>
                <span className="text-[#f07b22] block sm:inline drop-shadow-[0_2px_15px_rgba(240,123,34,0.3)]">{slide.titleOrange}</span>
              </h1>

              <p className={`text-xs sm:text-sm md:text-base text-zinc-200/90 max-w-2xl mx-auto font-light leading-relaxed tracking-wide transition-all duration-700 delay-700 transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {slide.subtitle}
              </p>

              {/* Glowing CTA Button */}
              <div className={`pt-4 transition-all duration-700 delay-[900ms] transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <Link
                  href={slide.ctaLink}
                  className="spotlight-wrapper inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all shadow-xl shadow-orange-500/35 hover:scale-105 active:scale-95 hover:shadow-orange-500/50"
                >
                  Đăng Ký Tư Vấn <ArrowRight className="w-4 h-4 animate-float-horizontal" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Down arrow scroll helper */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1 select-none pointer-events-none">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-extrabold">Cuộn Xuống</span>
        <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
      </div>

      {/* Prev/Next buttons */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white flex items-center justify-center border border-white/10 backdrop-blur-md shadow-lg transition-all opacity-0 group-hover/slideshow:opacity-100 hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white flex items-center justify-center border border-white/10 backdrop-blur-md shadow-lg transition-all opacity-0 group-hover/slideshow:opacity-100 hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'bg-orange-500 w-10' : 'bg-white/40 w-2.5 hover:bg-white/80'}`}
          />
        ))}
      </div>

      <div className="hidden" aria-hidden="true">
        {slides.map((slide, idx) => (
          <img key={idx} src={slide.url} alt="preload" />
        ))}
      </div>
    </section>
  );
}
