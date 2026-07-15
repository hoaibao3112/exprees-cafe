'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { useBannersQuery } from '@/hooks/useContentQueries';
import { resolveUploadUrl } from '@/lib/api';
import { fadeUp, staggerContainer, springHover, springTap, EASE_PREMIUM } from '@/lib/motion';

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

  const homeHeroBanners = dbBanners.filter(b => b.position === 'HOME_HERO' && b.isActive);

  const slides = homeHeroBanners.length > 0 ? homeHeroBanners.map(b => {
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

  const slide = slides[activeSlide];
  if (!slide) return null;

  return (
    <section className="relative w-full h-[400px] sm:h-[500px] md:h-[620px] bg-zinc-950 overflow-hidden group/slideshow">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeSlide}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1, ease: EASE_PREMIUM }}
        >
          <div className="absolute inset-0 w-full h-full">
            <motion.div
              className="absolute inset-0 w-full h-full"
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 8, ease: 'linear' }}
            >
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                priority={activeSlide === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </div>
          {/* Enhanced Multi-layer Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Premium Glassmorphic content layout — stagger reveal */}
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
            variants={staggerContainer(0.15, 0.2)}
            initial="hidden"
            animate="show"
          >
            <div className="max-w-3xl space-y-4">
              {/* Glassmorphic Badge */}
              <motion.div variants={fadeUp}>
                <span className="starburst-wrapper inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/40 px-5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-400 backdrop-blur-md shadow-lg shadow-orange-950/20">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" /> MỸ THUẬT RANG XAY & CÔNG NGHỆ SAAS
                </span>
              </motion.div>

              {/* Responsive Title */}
              <motion.h1
                variants={fadeUp}
                className="text-2xl sm:text-4xl md:text-6xl font-black uppercase leading-none drop-shadow-2xl tracking-wide"
              >
                <span className="text-white block sm:inline drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{slide.titleWhite} </span>
                <span className="text-[#f07b22] block sm:inline drop-shadow-[0_2px_15px_rgba(240,123,34,0.3)]">{slide.titleOrange}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-xs sm:text-sm md:text-base text-zinc-200/90 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
              >
                {slide.subtitle}
              </motion.p>

              {/* Glowing CTA Button */}
              <motion.div variants={fadeUp} className="pt-4">
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.05, transition: springHover }}
                  whileTap={{ scale: 0.95, transition: springTap }}
                >
                  <Link
                    href={slide.ctaLink}
                    className="spotlight-wrapper inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-colors shadow-xl shadow-orange-500/35 hover:shadow-orange-500/50"
                  >
                    Đăng Ký Tư Vấn <ArrowRight className="w-4 h-4 animate-float-horizontal" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Down arrow scroll helper */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1 select-none pointer-events-none">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-extrabold">Cuộn Xuống</span>
        <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
      </div>

      {/* Prev/Next buttons */}
      <motion.button
        onClick={handlePrevSlide}
        whileHover={{ scale: 1.1, transition: springHover }}
        whileTap={{ scale: 0.9, transition: springTap }}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white flex items-center justify-center border border-white/10 backdrop-blur-md shadow-lg transition-colors opacity-0 group-hover/slideshow:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>
      <motion.button
        onClick={handleNextSlide}
        whileHover={{ scale: 1.1, transition: springHover }}
        whileTap={{ scale: 0.9, transition: springTap }}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-orange-500 text-white flex items-center justify-center border border-white/10 backdrop-blur-md shadow-lg transition-colors opacity-0 group-hover/slideshow:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

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
        {slides.map((s, idx) => (
          <img key={idx} src={s.url} alt="preload" />
        ))}
      </div>
    </section>
  );
}
