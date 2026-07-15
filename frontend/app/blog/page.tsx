'use client';

import { useState } from 'react';
import { useArticlesQuery, useBannersQuery } from '../../hooks/useContentQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { 
  BookOpen, 
  Clock, 
  Tag, 
  RefreshCw, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { resolveUploadUrl } from '../../lib/api';
import { OptimizedImage } from '../../components/ui/OptimizedImage';

const ARTICLES_PER_PAGE = 6;

function stripHtmlAndEntities(html: string): string {
  if (!html) return '';
  let text = html.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  return text.replace(/\s+/g, ' ').trim();
}

export default function BlogPage() {
  useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterFeedback, setNewsletterFeedback] = useState<boolean>(false);

  // Fetch articles and banners dynamically from the NestJS PostgreSQL backend
  const { data: articles, isLoading: isLoadingArticles } = useArticlesQuery();
  const { data: banners, isLoading: isLoadingBanners } = useBannersQuery();

  const activeBanner = (banners || []).find((b) => b.position === 'BLOG_HERO');
  const bgImage = activeBanner ? resolveUploadUrl(activeBanner.imageUrl) : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200';
  const pageTitle = activeBanner ? activeBanner.title : 'Blog & Tin Tức';
  const pageSubtitle = activeBanner ? activeBanner.linkUrl : 'Express Cafe Blog';

  const renderTitle = () => {
    const words = pageTitle.split(' ');
    if (words.length <= 1) return <span className="text-white">{pageTitle}</span>;
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

  // Filter out F&B services to only display standard blog/news articles
  const blogAndNewsArticles = (articles || []).filter(
    (item) => item.blogHandle === 'news' || item.blogHandle === 'blog'
  );

  // Filter based on active sidebar category
  const filteredArticles = blogAndNewsArticles.filter((item) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'NEWS') return item.blogHandle === 'news';
    if (activeCategory === 'BLOG') return item.blogHandle === 'blog';
    return true;
  });

  // Calculate pagination variables
  const totalArticles = filteredArticles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  // Extract recent articles (top 7 newest)
  const recentArticles = [...blogAndNewsArticles]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 7);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterFeedback(true);
    setTimeout(() => {
      setNewsletterFeedback(false);
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[240px] md:h-[320px] bg-zinc-950 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.55)), url(${bgImage})`,
          backgroundPosition: 'center 50%',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          {pageSubtitle && (
            <span 
              className="inline-block text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-orange-400 mb-3 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20"
              data-animate="fade-down"
            >
              {pageSubtitle}
            </span>
          )}
          
          <h1 data-animate="blur-in" className="font-black text-4xl md:text-5xl uppercase tracking-wider leading-none">
            {renderTitle()}
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 font-body text-xs font-light mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Blog</span>
          </div>
        </div>
      </section>

      {/* 3. Main Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Articles Grid */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {isLoadingArticles ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-xs font-semibold">Đang tải bản tin...</p>
              </div>
            ) : paginatedArticles.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-200 bg-zinc-50 rounded-3xl">
                <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="font-bold text-zinc-700">Chưa có bài viết nào</h3>
                <p className="text-xs text-zinc-400 mt-1">Hệ thống đang được cập nhật các nội dung bổ ích mới.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {paginatedArticles.map((article, index) => {
                    const localDate = article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
                      : 'Gần đây';
                    return (
                      <div 
                        key={article.id}
                        data-animate="fade-up"
                        data-delay={String(((index % 6) + 1) * 150)}
                        className="card-tilt group bg-white rounded-3xl border border-zinc-150 overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Thumbnail wrapped in standard dynamic Link */}
                          <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/10] bg-zinc-100 overflow-hidden border-b border-zinc-100">
                             <OptimizedImage 
                               src={article.imageUrl ? resolveUploadUrl(article.imageUrl) : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=500&auto=format&fit=crop'} 
                               alt={article.title}
                               fill
                               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 overflow-hidden"
                             />
                            
                            <span className="absolute top-4 left-4 text-[9px] font-body font-medium uppercase tracking-wider text-orange-500 bg-orange-50/95 border border-orange-200/50 px-3 py-1 rounded-lg shadow-sm">
                              {article.blogHandle === 'news' ? 'TIN TỨC' : 'EXPERIENCE'}
                            </span>
                          </Link>
 
                          {/* Card Content Body */}
                          <div className="p-6">
                            {/* Date published */}
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold mb-3">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="font-reading">{localDate}</span>
                              <span>•</span>
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="font-reading">5 phút đọc</span>
                            </div>
 
                            <Link href={`/blog/${article.slug}`} className="block hover:text-orange-500">
                              <h3 className="font-body font-semibold text-lg leading-snug text-zinc-950 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
                                {article.title}
                              </h3>
                            </Link>
                            
                            <p className="font-reading font-light text-zinc-500 text-sm leading-relaxed mt-3 line-clamp-3">
                              {article.contentHtml 
                                ? stripHtmlAndEntities(article.contentHtml || '').slice(0, 140) + '...'
                                : 'Tìm hiểu những chia sẻ hữu ích, thông tin chuyển giao mô hình xe cà phê và công thức pha chế...'
                              }
                            </p>
                          </div>
                        </div>
 
                        {/* Card CTA Button */}
                        <div className="p-6 pt-0">
                          <Link
                            href={`/blog/${article.slug}`}
                            className="spotlight-wrapper block w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all duration-200 text-white font-body font-bold text-xs tracking-[0.15em] uppercase rounded-xl shadow-md shadow-orange-500/10 text-center"
                          >
                            ĐỌC TIẾP
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls Block */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-12 border-t border-zinc-100 pt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      const active = page === currentPage;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                            active 
                              ? 'bg-orange-500 text-white shadow-md' 
                              : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Section */}
          <div className="lg:col-span-4 space-y-10" data-animate="fade-up" data-delay="100">
            
            {/* Box 1: Recent Posts List */}
            <div className="p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-6">
              <h3 className="font-body font-semibold tracking-widest uppercase text-xs text-zinc-400 pb-3 border-b border-zinc-200">
                Bài viết mới nhất
              </h3>

              <div className="flex flex-col gap-4">
                {isLoadingArticles ? (
                  <div className="py-6 text-center text-zinc-400 text-xs">Đang tải danh sách bài...</div>
                ) : recentArticles.length === 0 ? (
                  <div className="py-6 text-center text-zinc-400 text-xs">Chưa có bài viết mới.</div>
                ) : (
                  recentArticles.map((article, idx) => (
                    <Link 
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="group flex gap-3.5 items-start"
                    >
                      {/* Number tag */}
                      <span className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-body font-semibold text-[10px] shrink-0 mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        {idx + 1}
                      </span>
                      
                      {/* Title link */}
                      <div className="space-y-1">
                        <h4 className="font-body font-semibold text-xs text-zinc-900 group-hover:text-orange-500 transition-colors duration-300 leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        <span className="block font-reading font-light text-[9px] text-zinc-400 uppercase tracking-wider">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Box 2: Blog Categories and Quick Navigation Links */}
            <div className="p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-6">
              <h3 className="font-body font-semibold tracking-widest uppercase text-xs text-zinc-400 pb-3 border-b border-zinc-200">
                Danh mục Blog
              </h3>

              <nav className="flex flex-col gap-2">
                {/* Category filters */}
                <button 
                  onClick={() => { setActiveCategory('ALL'); setCurrentPage(1); }}
                  data-active={activeCategory === 'ALL'}
                  className={`w-full py-2.5 px-4 rounded-xl text-left font-body font-medium text-xs tracking-widest uppercase transition-all duration-200 data-[active=true]:scale-105 data-[active=true]:shadow-sm ${
                    activeCategory === 'ALL' 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150'
                  }`}
                >
                  Tất cả bài viết ({blogAndNewsArticles.length})
                </button>

                <button 
                  onClick={() => { setActiveCategory('NEWS'); setCurrentPage(1); }}
                  data-active={activeCategory === 'NEWS'}
                  className={`w-full py-2.5 px-4 rounded-xl text-left font-body font-medium text-xs tracking-widest uppercase transition-all duration-200 data-[active=true]:scale-105 data-[active=true]:shadow-sm ${
                    activeCategory === 'NEWS' 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150'
                  }`}
                >
                  Tin tức F&B ({blogAndNewsArticles.filter(a => a.blogHandle === 'news').length})
                </button>

                <button 
                  onClick={() => { setActiveCategory('BLOG'); setCurrentPage(1); }}
                  data-active={activeCategory === 'BLOG'}
                  className={`w-full py-2.5 px-4 rounded-xl text-left font-body font-medium text-xs tracking-widest uppercase transition-all duration-200 data-[active=true]:scale-105 data-[active=true]:shadow-sm ${
                    activeCategory === 'BLOG' 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150'
                  }`}
                >
                  Kinh nghiệm/Blogs ({blogAndNewsArticles.filter(a => a.blogHandle === 'blog').length})
                </button>

                {/* Separator */}
                <div className="h-[1px] bg-zinc-200 my-2" />

                {/* Smart links navigation redirects matching sidebar items in mockup */}
                <Link 
                  href="/services" 
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Dịch vụ liên kết F&B</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link 
                  href="/franchise" 
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Hợp tác Nhượng Quyền</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link 
                  href="/branches" 
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Hệ thống Chi Nhánh</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link 
                  href="/contact" 
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Thông tin Liên Hệ</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </nav>
            </div>

          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}
