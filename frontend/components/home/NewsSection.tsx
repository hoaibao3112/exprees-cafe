'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { useArticlesQuery } from '@/hooks/useContentQueries';
import { resolveUploadUrl } from '@/lib/api';

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

export function NewsSection() {
  const { data: articles, isLoading: isLoadingArticles } = useArticlesQuery();

  const blogAndNewsArticles = (articles || []).filter(
    (item) => item.blogHandle === 'news' || item.blogHandle === 'blog'
  );

  return (
    <section id="news" className="py-24 bg-white relative overflow-hidden border-t border-zinc-100">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #000 10%, transparent 11%)`,
          backgroundSize: '16px 16px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-title-wrapper mb-16 text-center" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-2 rounded-full border border-[#f07b22]/20">
            Tin Tức &amp; Sự Kiện
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase mt-4">
            BẢN TIN <span className="gradient-text">EXPRESS CAFE</span>
          </h2>
          <div className="section-underline mt-3 mx-auto" />
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
        ) : !articles || blogAndNewsArticles.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-zinc-50 rounded-3xl max-w-md mx-auto shadow-sm">
            <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-zinc-700">Chưa có bài viết tin tức nào</h3>
            <p className="text-sm text-zinc-400 mt-1">Nội dung đang được ban biên tập chuẩn bị.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogAndNewsArticles.slice(0, 3).map((article, idx) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                data-animate="fade-up"
                data-delay={String((idx + 1) * 150)}
                className="group rounded-3xl border border-zinc-200/80 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col bg-white cursor-pointer"
              >
                {/* Card Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={resolveUploadUrl(article.imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=500&auto=format&fit=crop')}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Card Content with Orange gradient background */}
                <div className="p-6 bg-gradient-to-br from-[#f07b22] to-orange-600 text-white flex-1 flex flex-col justify-between shadow-inner">
                  <div>
                    <h3 className="font-bold text-[14px] sm:text-[15px] text-white leading-snug tracking-wide uppercase line-clamp-3 mb-4 min-h-[64px] group-hover:text-zinc-100 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                  <div className="text-zinc-100 text-[11px] sm:text-xs font-semibold tracking-wider flex items-center gap-1.5 border-t border-white/10 pt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatVietnameseDate(article.publishedAt || article.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
