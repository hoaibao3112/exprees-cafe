'use client';

import { useState } from 'react';
import { useArticlesQuery, useBannersQuery } from '../../hooks/useContentQueries';
import { ArrowLeft, BookOpen, Clock, Tag, RefreshCw, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const { data: articles, isLoading: isLoadingArticles } = useArticlesQuery();
  const { data: banners, isLoading: isLoadingBanners } = useBannersQuery();

  const handleNextSlide = () => {
    if (!banners || banners.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % banners.length);
  };

  const handlePrevSlide = () => {
    if (!banners || banners.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const activeBanner = banners && banners.length > 0 ? banners[activeSlide] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Background ambient blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                EXPRESS BLOG
              </span>
            </div>
          </div>
          <Link
            href="/reviews"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            Đánh Giá Sản Phẩm
          </Link>
        </div>
      </header>

      {/* Banner HERO Slideshow */}
      {isLoadingBanners ? (
        <div className="h-64 flex items-center justify-center text-slate-500 max-w-6xl mx-auto px-4 mt-6">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mr-2" />
          <span>Đang tải slideshow quảng cáo...</span>
        </div>
      ) : activeBanner ? (
        <section className="max-w-6xl mx-auto px-4 mt-6 relative group">
          <div className="h-80 w-full rounded-3xl overflow-hidden relative border border-slate-800 shadow-xl">
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            {/* Dark glassmorphic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Chương trình nổi bật
              </span>
              <h2 className="text-xl md:text-3xl font-black text-white mt-3 leading-tight max-w-2xl">
                {activeBanner.title}
              </h2>
              {activeBanner.linkUrl && (
                <Link
                  href={activeBanner.linkUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 mt-4 hover:underline"
                >
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          {banners && banners.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeSlide ? 'bg-indigo-500 w-5' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}

      {/* Main Articles Grid */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-black tracking-tight text-slate-200 mb-6 flex items-center gap-2">
          <BookOpen className="text-indigo-500" /> Bản Tin Ẩm Thực Express
        </h2>

        {isLoadingArticles ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm">Đang tải các bài viết chia sẻ...</p>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-3xl bg-slate-900/10">
            <BookOpen className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400 text-sm">Hiện chưa có bài viết nào được đăng</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="group border border-slate-800 bg-slate-900/30 rounded-3xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Simulated Article Cover Image using harmonized colored placeholders */}
                <div className="h-44 w-full bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-slate-800" />
                  <CoffeeCoverImage slug={item.slug} />
                  <span className="absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-md backdrop-blur-md">
                    {item.blogHandle === 'news' ? 'Tin tức F&B' : 'Kinh nghiệm pha'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm line-clamp-2 leading-relaxed">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>5 phút đọc</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Slide-in overlay modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-xs"
            >
              ✕
            </button>

            <div className="p-6 md:p-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                {selectedArticle.blogHandle === 'news' ? 'Bản tin F&B' : 'Chia sẻ công thức'}
              </span>
              <h2 className="text-lg md:text-2xl font-black text-slate-200 mt-4 leading-relaxed">
                {selectedArticle.title}
              </h2>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span>Người viết: Admin Express</span>
                <span>•</span>
                <span>
                  Ngày đăng: {selectedArticle.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                </span>
              </div>

              <div
                className="mt-8 prose prose-invert max-w-none text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-6 space-y-4"
                dangerouslySetInnerHTML={{ __html: selectedArticle.contentHtml }}
              />

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple beautiful themed mock visual representation backgrounds for F&B articles
function CoffeeCoverImage({ slug }: { slug: string }) {
  if (slug.includes('phin')) {
    return (
      <img
        src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        alt="Phin Coffee"
      />
    );
  }
  return (
    <img
      src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      alt="Specialty Coffee"
    />
  );
}
