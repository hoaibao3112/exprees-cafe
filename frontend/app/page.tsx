'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Coffee,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Phone
} from 'lucide-react';
import { useFranchisePackagesQuery } from '../hooks/useFranchiseQueries';
import { useArticlesQuery, useVideosQuery, useBannersQuery } from '../hooks/useContentQueries';
import { useBranchesQuery } from '../hooks/useBranchQueries';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { resolveUploadUrl } from '../lib/api';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

// Helper to resolve local assets or backend uploads
const resolveLocalOrUpload = (url?: string | null) => {
  if (!url) return '';
  
  let normalizedUrl = url;
  if (url.startsWith('http://localhost:3000/')) {
    normalizedUrl = url.substring('http://localhost:3000/'.length);
  }

  if (normalizedUrl.startsWith('uploads/') || normalizedUrl.startsWith('/uploads/')) {
    const cleanPath = normalizedUrl.startsWith('/') ? normalizedUrl.slice(1) : normalizedUrl;
    return resolveUploadUrl(cleanPath);
  }
  if (normalizedUrl.startsWith('/') || normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
    return normalizedUrl;
  }
  return resolveUploadUrl(normalizedUrl);
};

// Slideshow images configuration
const SLIDES = [
  {
    url: '/slideshow_1.jpg',
    alt: 'Dịch vụ cho thuê máy cà phê',
    titleWhite: 'CHO THUÊ',
    titleOrange: 'MÁY PHA CÀ PHÊ',
    subtitle: 'Giải pháp chuyên nghiệp cho văn phòng, nhà hàng và chuỗi kinh doanh F&B'
  },
  {
    url: '/slideshow_2.jpg',
    alt: 'Nhượng quyền 0 đồng - Mô hình ki-ốt',
    titleWhite: 'NHƯỢNG QUYỀN',
    titleOrange: 'THƯƠNG HIỆU 0Đ',
    subtitle: 'Hỗ trợ khởi nghiệp trọn gói, tối ưu hóa lợi nhuận, thời gian hoàn vốn cực nhanh'
  },
  {
    url: '/slideshow_3.jpg',
    alt: 'Thưởng thức cà phê sạch nguyên chất',
    titleWhite: 'HƯƠNG VỊ',
    titleOrange: 'NGUYÊN BẢN ĐÍNH THỰC',
    subtitle: 'Nguồn cà phê sạch hữu cơ 100% Robusta & Arabica từ nông trại Đắk Lắk'
  },
  {
    url: '/slideshow_4.jpg',
    alt: 'Hệ thống nhượng quyền Express Cafe',
    titleWhite: 'VẬN HÀNH',
    titleOrange: 'SAAS THÔNG MINH',
    subtitle: 'Quản trị chuỗi tự động từ xa với phần mềm POS & GPS hiện đại dẫn đầu xu thế'
  }
];

// Mapping for dynamic franchise packages to images and display model types
const MODEL_DETAILS: Record<string, { image: string; tag: string; title: string }> = {
  'EXPRESS': {
    image: '/media__1780386795847.png',
    tag: 'MÔ HÌNH QUÁN TINH GỌN',
    title: 'MÔ HÌNH QUÁN TINH GỌN'
  },
  'KIOSK': {
    image: '/media__1780386795859.png',
    tag: 'MÔ HÌNH XE TAKE AWAY LINH ĐỘNG',
    title: 'MÔ HÌNH XE TAKE AWAY LINH ĐỘNG'
  },
  'PREMIUM': {
    image: '/media__1780386795867.png',
    tag: 'MÔ HÌNH KIOSK TIỆN LỢI',
    title: 'MÔ HÌNH KIOSK TIỆN LỢI'
  }
};

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export default function Home() {
  // Activate scroll animations
  useScrollAnimation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  // Slideshow state
  const [activeSlide, setActiveSlide] = useState(0);

  // Accordion state
  const [activeAccordion, setActiveAccordion] = useState<string>('tam-nhin');

  // Query database packages
  const { data: packages, isLoading } = useFranchisePackagesQuery();
  const { data: articles, isLoading: isLoadingArticles } = useArticlesQuery();
  const { data: videos, isLoading: isLoadingVideos } = useVideosQuery();
  const { data: branches, isLoading: isLoadingBranches } = useBranchesQuery();
  const { data: dbBanners = [] } = useBannersQuery();

  // Dynamically map backend banners, with support for premium split title coloring
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

  // State for playing YouTube video lightbox
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Helper to extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Helper to format date into Vietnamese weekday format
  const formatVietnameseDate = (dateStr?: string) => {
    if (!dateStr) return 'Thứ Ba 03/02/2026';
    try {
      const date = new Date(dateStr);
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const weekday = weekdays[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${weekday} ${day}/${month}/${year}`;
    } catch {
      return 'Thứ Ba 03/02/2026';
    }
  };

  // Automatic slideshow rotation every 5 seconds
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

  const accordionItems: AccordionItem[] = [
    {
      id: 'tam-nhin',
      title: 'Tầm nhìn',
      content: 'Trở thành chuỗi cà phê nhượng quyền công nghệ hàng đầu Việt Nam, mang sản phẩm cà phê hữu cơ sạch tinh khiết phục vụ hàng triệu người tiêu dùng năng động.'
    },
    {
      id: 'su-menh',
      title: 'Sứ mệnh',
      content: 'Đem lại giá trị khởi nghiệp nhượng quyền thịnh vượng với rủi ro thấp nhất cho đối tác, đồng thời đảm bảo chất lượng cà phê đồng đều và vượt trội cho khách hàng.'
    },
    {
      id: 'hoat-dong',
      title: 'Cho thuê máy/Hoạt động',
      content: 'Cung cấp giải pháp cho thuê máy pha cà phê chuyên nghiệp trọn gói cho văn phòng, khách sạn và quán kinh doanh với chi phí cực kỳ tiết kiệm chỉ từ 1 ly cà phê/ngày.'
    },
    {
      id: 'y-nghia-thuong-hieu',
      title: 'Ý nghĩa thương hiệu Express Cafe',
      content: '“Express” mang ý nghĩa tốc độ, tinh gọn và đột phá công nghệ. “Cafe” là hương vị nguyên bản truyền thống Việt Nam. Sự kết hợp thể hiện mục tiêu đổi mới sáng tạo không ngừng nghỉ.'
    },
    {
      id: 'gia-tri-cot-loi',
      title: 'Giá trị cốt lõi',
      content: 'Nguyên liệu sạch 100% - Vận hành tối giản - Công nghệ dẫn đầu (POS/GPS/CMS) - Đồng hành chia sẻ lợi ích bền vững cùng nhà đầu tư.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-800 font-sans antialiased">

      {/* Shared Navigation Header */}
      <Header />

      {/* Hero Slideshow Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] md:h-[620px] bg-zinc-950 overflow-hidden group/slideshow">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}
          >
            {/* Slide Image with Ken Burns effect */}
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
            {/* Premium multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Content overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-start text-center px-4 pt-12 sm:pt-16 md:pt-24">
              <div className="max-w-3xl space-y-3">
                {/* Badge with starburst */}
                <div className={`transition-all duration-700 delay-300 transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <span className="starburst-wrapper inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-400 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 animate-swing" /> MỸ THUẬT RANG XAY & CÔNG NGHỆ SAAS
                  </span>
                </div>

                {/* Title with ink-bleed when active */}
                <h1 className={`text-lg sm:text-2xl md:text-4xl font-black uppercase leading-tight drop-shadow-xl transition-all duration-700 delay-500 transform ${
                  idx === activeSlide ? 'translate-y-0 opacity-100 animate-ink-bleed' : 'translate-y-4 opacity-0'
                }`}>
                  <span className="text-white">{slide.titleWhite} </span>
                  <span className="text-[#f07b22]">{slide.titleOrange}</span>
                </h1>

                <p className={`text-[10px] sm:text-xs md:text-sm text-zinc-300/85 max-w-xl mx-auto font-light leading-relaxed transition-all duration-700 delay-700 transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  {slide.subtitle}
                </p>

                {/* CTA button with spotlight sweep */}
                <div className={`pt-2 transition-all duration-700 delay-[900ms] transform ${idx === activeSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <Link
                    href={slide.ctaLink}
                    className="spotlight-wrapper inline-flex items-center gap-1.5 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-full transition-all shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 animate-glow-pulse"
                  >
                    Đăng Ký Tư Vấn <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Scroll bounce indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white/40 animate-scroll-bounce" />
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-zinc-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover/slideshow:opacity-100 hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-zinc-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover/slideshow:opacity-100 hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlide ? 'bg-orange-500 w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </section>

      {/* Nhượng Quyền 0 Đồng Section */}
      <section id="franchise" className="py-20 bg-gradient-to-br from-orange-50/70 via-white to-orange-50/50 relative overflow-hidden">
        {/* Background ambient orbs */}
        <div className="absolute top-1/4 left-[-15%] w-[45vw] h-[45vw] rounded-full bg-orange-100/40 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-100/30 blur-[100px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="section-title-wrapper mb-14" data-animate="fade-up">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase">
              NHƯỢNG QUYỀN <span className="gradient-text">0 ĐỒNG</span>
            </h2>
            <div className="section-underline mt-3" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
                  <div className="skeleton w-full h-64" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-5 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-10 w-36 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !packages || packages.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white/80 backdrop-blur-md rounded-3xl max-w-lg mx-auto shadow-sm" data-animate="bounce-in">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
              </div>
              <h3 className="font-bold text-lg text-zinc-800">Chưa có dữ liệu gói nhượng quyền</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">Hệ thống đang đồng bộ dữ liệu. Quý đối tác vui lòng quay lại sau hoặc liên hệ Hotline để nhận tư vấn trực tiếp.</p>
              <Link href="/contact" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md">
                Liên hệ tư vấn
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, idx) => {
                const details = {
                  image: resolveLocalOrUpload((pkg.images && pkg.images.length > 0) ? pkg.images[0] : (MODEL_DETAILS[pkg.modelType]?.image || '/media__1780386795847.png')),
                  tag: MODEL_DETAILS[pkg.modelType]?.tag || 'MÔ HÌNH NHƯỢNG QUYỀN',
                  title: pkg.name,
                };

                return (
                  <div
                    key={pkg.id}
                    data-animate="fade-up"
                    data-delay={String((idx + 1) * 150)}
                    className="card-tilt group bg-white/70 backdrop-blur-md rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={details.image}
                          alt={details.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Model Category Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md ${
                            pkg.modelType === 'PREMIUM' 
                              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                              : pkg.modelType === 'KIOSK' 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          }`}>
                            {pkg.modelType || 'EXPRESS'}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase block mb-1">
                          {details.tag}
                        </span>
                        <h3 className="font-bold text-base text-zinc-900 tracking-wide uppercase line-clamp-1 mb-2 group-hover:text-orange-500 transition-colors duration-300">
                          {details.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Action Button with spotlight */}
                    <div className="px-6 pb-8 pt-0 flex flex-col">
                      <Link
                        href={`/franchise/${pkg.id}`}
                        className="spotlight-wrapper inline-flex items-center justify-between w-full sm:w-[150px] px-6 py-3 bg-[#e9762b] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-[0.98] hover:scale-105"
                      >
                        <span>XEM THÊM</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {/* Tin Tức Section */}
      <section id="news" className="py-20 bg-white relative overflow-hidden border-t border-zinc-100">
        {/* Background Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%)`,
            backgroundSize: '16px 16px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="section-title-wrapper mb-14" data-animate="fade-up">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase">
              TIN TỨC & <span className="gradient-text">SỰ KIỆN</span>
            </h2>
            <div className="section-underline mt-3" />
          </div>

          {isLoadingArticles ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm h-[320px] p-4 flex flex-col gap-4">
                  <div className="skeleton w-full h-48 rounded-2xl" />
                  <div className="skeleton h-6 w-3/4" />
                  <div className="skeleton h-4 w-1/2 mt-auto" />
                </div>
              ))}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-md mx-auto shadow-sm">
              <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-zinc-700">Chưa có bài viết tin tức nào</h3>
              <p className="text-sm text-zinc-400 mt-1">Nội dung đang được ban biên tập chuẩn bị.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map((article, idx) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  data-animate="fade-up"
                  data-delay={String((idx + 1) * 150)}
                  className="card-tilt group rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col bg-white cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={resolveLocalOrUpload(article.imageUrl || '/slideshow_1.jpg')}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Card Content (Solid orange background) */}
                  <div className="p-6 bg-[#f07b22] text-white flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[14px] sm:text-[15px] text-white leading-snug tracking-wide uppercase line-clamp-3 mb-4 min-h-[64px]">
                        {article.title}
                      </h3>
                    </div>
                    <div className="text-zinc-100 text-[11px] sm:text-xs font-medium">
                      {formatVietnameseDate(article.publishedAt || article.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section id="videos" className="py-20 bg-zinc-50 relative overflow-hidden border-t border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="section-title-wrapper mb-14" data-animate="fade-up">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase">
              KÊNH <span className="gradient-text">VIDEO</span>
            </h2>
            <div className="section-underline mt-3" />
          </div>

          {isLoadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm h-[280px] p-4 flex flex-col gap-4">
                  <div className="skeleton w-full h-40 rounded-2xl" />
                  <div className="skeleton h-6 w-5/6" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : !videos || videos.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-md mx-auto shadow-sm">
              <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-zinc-700">Chưa có video nào</h3>
              <p className="text-sm text-zinc-400 mt-1">Đang cập nhật video clip mới từ kênh chính thức.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videos.slice(0, 3).map((video, idx) => {
                const yId = getYoutubeId(video.youtubeUrl);
                return (
                  <div
                    key={video.id}
                    data-animate="fade-up"
                    data-delay={String((idx + 1) * 100)}
                    onClick={() => yId && setPlayingVideo(yId)}
                    className="group bg-white rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail (YouTube preview overlay) */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                        <Image
                          src={resolveLocalOrUpload(video.thumbnailUrl)}
                          alt={video.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                        />
                        {/* Red Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-black/30 group-hover:bg-red-700 group-hover:scale-110 transition-all duration-350">
                            <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-sm sm:text-base text-zinc-950 leading-snug tracking-wide line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold tracking-wider uppercase">
                          {video.channelName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Chi Nhánh Section */}
      <section id="branches" className="py-20 bg-white relative overflow-hidden border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="section-title-wrapper mb-14" data-animate="fade-up">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase">
              HỆ THỐNG <span className="gradient-text">CHI NHÁNH</span>
            </h2>
            <div className="section-underline mt-3" />
          </div>

          {isLoadingBranches ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm h-[200px] p-4 flex flex-col gap-4">
                  <div className="skeleton w-full h-32 rounded-2xl" />
                  <div className="skeleton h-5 w-2/3 mx-auto mt-2" />
                </div>
              ))}
            </div>
          ) : !branches || branches.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-md mx-auto shadow-sm">
              <MapPin className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-zinc-700">Chưa có chi nhánh hoạt động</h3>
              <p className="text-sm text-zinc-400 mt-1">Hệ thống cửa hàng trên toàn quốc đang chuẩn bị khai trương.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {branches.slice(0, 4).map((branch, idx) => (
                <Link
                  key={branch.id}
                  href={`/branches?id=${branch.id}`}
                  data-animate="fade-up"
                  data-delay={String((idx + 1) * 100)}
                  className="card-tilt group rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col bg-white cursor-pointer"
                >
                  {/* Storefront Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={resolveLocalOrUpload(branch.imageUrl || '/slideshow_3.jpg')}
                      alt={branch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Branch name footer strip */}
                  <div className="p-4 bg-[#f07b22] text-white text-center">
                    <h3 className="font-extrabold text-xs sm:text-[13px] text-white tracking-wider uppercase line-clamp-2">
                      EXPRESS CAFE - {branch.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Giới Thiệu Section */}
      <section id="about" className="py-20 bg-zinc-50 border-t border-b border-zinc-100 relative overflow-hidden">
        {/* Background ambient orbs */}
        <div className="absolute bottom-1/4 right-[-10%] w-[25vw] h-[25vw] rounded-full bg-orange-100/20 blur-[80px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-title-wrapper mb-14" data-animate="fade-up">
            <span className="text-xs font-black uppercase tracking-widest text-[#f07b22]">Về Chúng Tôi</span>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-wider mt-1 uppercase">
              GIỚI THIỆU <span className="gradient-text">EXPRESS CAFE</span>
            </h2>
            <div className="section-underline mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side Image */}
            <div className="lg:col-span-5 relative" data-animate="fade-right" data-delay="100">
              <div className="absolute inset-0 bg-orange-500 rounded-3xl translate-x-3 translate-y-3 z-0" />
              <div className="relative z-10 aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-zinc-200">
                <Image
                  src="/h-about_banner.jpg"
                  alt="Express Cafe Team"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right side Accordion */}
            <div className="lg:col-span-7 space-y-3" data-animate="fade-left" data-delay="200">
              {accordionItems.map((item) => {
                const isOpen = activeAccordion === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-2xl transition-all duration-300 ${isOpen
                      ? 'border-orange-500/30 bg-white shadow-md shadow-orange-500/5'
                      : 'border-zinc-200/80 bg-white/70 hover:bg-white hover:border-zinc-300'
                      }`}
                  >
                    <button
                      onClick={() => setActiveAccordion(isOpen ? '' : item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-orange-500' : 'text-zinc-800'
                        }`}>
                        {item.title}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-orange-500 transition-transform duration-300 rotate-180" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-zinc-400 transition-transform duration-300" />
                      )}
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-zinc-600 leading-relaxed border-t border-zinc-50">
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-6">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md shadow-orange-500/20 active:scale-95"
                >
                  XEM THÊM <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Light Statistics & Story Footer */}
      <section className="relative py-20 bg-white text-zinc-800 overflow-hidden border-t border-zinc-100">
        {/* Background wood flooring styling pattern */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200')` }}
        />
        <div className="absolute bottom-0 right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Stats list với gradient text */}
            <div className="lg:col-span-6 grid grid-cols-3 gap-4 sm:gap-6 text-center" data-animate="fade-up">
              <div className="flex flex-col items-center bg-zinc-50/80 backdrop-blur-sm p-5 rounded-3xl border border-orange-100 hover:border-orange-200 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 shadow-inner">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                  <AnimatedCounter end={40} suffix="M+" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2 leading-tight">Ly Cà Phê Bán Ra</span>
              </div>
              
              <div className="flex flex-col items-center bg-zinc-50/80 backdrop-blur-sm p-5 rounded-3xl border border-orange-100 hover:border-orange-200 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                  <AnimatedCounter end={20} suffix="+" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2 leading-tight">Sự Kiện Đồng Hành</span>
              </div>

              <div className="flex flex-col items-center bg-zinc-50/80 backdrop-blur-sm p-5 rounded-3xl border border-orange-100 hover:border-orange-200 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3 shadow-inner">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                  <AnimatedCounter end={9} suffix="+" />
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2 leading-tight">Năm Phát Triển</span>
              </div>
            </div>

            {/* Story Box (Right) */}
            <div className="lg:col-span-6" data-animate="scale-up" data-delay="150">
              <div className="p-8 border border-zinc-200/80 rounded-3xl bg-zinc-50/50 backdrop-blur-md relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <h3 className="text-lg font-black tracking-wider text-orange-500 mb-4 uppercase">
                  EXPRESS CAFE
                </h3>
                <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                  Express Cafe tự hào mang đến nguồn sinh khí mới, năng động và đẳng cấp trong phong cách thưởng thức cà phê hiện đại. Chúng tôi kiến tạo nên một nền tảng bán hàng và vận hành thông minh từ xa, mang lại lợi ích thực tiễn cao nhất và bền vững cho mọi đối tác nhượng quyền đồng hành trên cả nước.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer (Bottom copyright) */}
      <Footer />

      {/* Dynamic YouTube Video Lightbox Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300">
          <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black text-white flex items-center justify-center font-bold transition-all hover:scale-105"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

    </div>
  );
}
