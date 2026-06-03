'use client';

import * as React from 'react';
import { useArticleBySlugQuery, useArticlesQuery } from '../../../hooks/useContentQueries';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw, 
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { resolveUploadUrl } from '../../../lib/api';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage(props: PageProps) {
  useScrollAnimation();
  const resolvedParams = React.use(props.params);
  const { slug } = resolvedParams as { slug: string };



  // Fetch article detail from database by slug
  const { data: article, isLoading: isLoadingArticle, error } = useArticleBySlugQuery(slug);
  
  // Fetch general articles to populate the sidebar list
  const { data: articles, isLoading: isLoadingArticles } = useArticlesQuery();

  // Filter out services and extract newest 7 articles for sidebar
  const blogAndNewsArticles = (articles || []).filter(
    (item) => item.blogHandle === 'news' || item.blogHandle === 'blog'
  );
  
  const recentArticles = [...blogAndNewsArticles]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice(0, 7);



  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-xs font-semibold text-zinc-400">Đang tải nội dung bài viết...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40 text-center px-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-lg text-zinc-850">Không tìm thấy bài viết</h3>
          <p className="text-xs text-zinc-400 mt-2">Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
          <Link 
            href="/blog" 
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-full shadow-md shadow-orange-500/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const articleDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
    : 'Mới đây';

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[180px] md:h-[220px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 data-animate="blur-in" className="text-2xl md:text-4xl font-heading font-semibold text-white uppercase tracking-wider leading-tight max-w-4xl mx-auto line-clamp-1">
            {article.title}
          </h1>
          
          {/* Breadcrumbs matching image spec */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-[10px] md:text-xs font-body font-light mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-orange-500 transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 max-w-[200px] md:max-w-[400px] truncate">{article.title}</span>
          </div>
        </div>
        
        {/* Decorative Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-8 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
          </svg>
        </div>
      </section>

      {/* 3. Main Articles Details Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Detailed Article Content */}
          <article className="lg:col-span-8 space-y-6">
            
            {/* Featured Image */}
            <div data-animate="scale-up" data-delay="200" className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md border border-zinc-150 bg-zinc-50">
              <OptimizedImage 
                src={article.imageUrl ? resolveUploadUrl(article.imageUrl) : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop'} 
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Metadata Row */}
            <div data-animate="fade-up" data-delay="100" className="flex items-center gap-4 text-[10px] md:text-xs text-zinc-400 font-body font-medium border-b border-zinc-150 pb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-reading">{articleDate}</span>
              </span>
              <span>•</span>
              <span className="font-reading">Tác giả: Ban Biên Tập Express Cafe</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-reading">5 phút đọc</span>
              </span>
            </div>

            {/* Full Dynamic Title */}
            <h2 className="text-xl md:text-3.5xl font-heading font-semibold text-zinc-950 leading-tight">
              {article.title}
            </h2>

            {/* HTML Render Body */}
            <div 
              data-animate="fade-up" 
              data-delay="300"
              className="prose prose-zinc max-w-none font-reading font-light text-base leading-[1.85] text-zinc-700 space-y-5 prose-headings:font-heading prose-headings:font-semibold prose-img:rounded-3xl prose-img:shadow-md prose-img:my-6 prose-a:text-orange-500 hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            {/* Navigation back */}
            <div className="pt-8 border-t border-zinc-100 mt-12 flex">
              <Link 
                href="/blog"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-zinc-950 hover:bg-orange-500 text-white font-body font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all duration-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tin
              </Link>
            </div>

          </article>

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
                  recentArticles.map((item, idx) => (
                    <Link 
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="group flex gap-3.5 items-start"
                    >
                      {/* Number tag */}
                      <span className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-body font-semibold text-[10px] shrink-0 mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        {idx + 1}
                      </span>
                      
                      {/* Title link */}
                      <div className="space-y-1">
                        <h4 className="font-body font-semibold text-xs text-zinc-900 group-hover:text-orange-500 transition-colors duration-300 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="block font-reading font-light text-[9px] text-zinc-400 uppercase tracking-wider">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Mới đây'}
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
                <Link 
                  href="/blog"
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Tất cả bài viết</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link 
                  href="/blog"
                  className="w-full py-2.5 px-4 rounded-xl text-left bg-white hover:bg-zinc-100/50 text-zinc-700 border border-zinc-150 flex items-center justify-between font-reading font-light text-sm"
                >
                  <span>Tin tức F&B</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                {/* Separator */}
                <div className="h-[1px] bg-zinc-200 my-2" />

                {/* Smart links navigation redirects */}
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
