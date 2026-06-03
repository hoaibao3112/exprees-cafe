'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { resolveUploadUrl } from '@/lib/api';
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff,
  ChevronLeft, ChevronRight, Filter, HelpCircle, Lightbulb
} from 'lucide-react';
import { adminArticlesApi } from '@/lib/admin-api';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from '@/components/admin/Toast';
import type { Article, BlogHandle, ArticleStatus } from '@/types/admin.types';

const HANDLE_LABELS: Record<BlogHandle, string> = { 
  news: 'Tin tức', 
  blog: 'Blog', 
  services: 'Dịch vụ' 
};

const HANDLE_COLORS: Record<BlogHandle, string> = {
  news: 'bg-blue-50 text-blue-600 border border-blue-100',
  blog: 'bg-purple-50 text-purple-600 border border-purple-100',
  services: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

// SVG sparklines or mini curves
const TREND_UP = (
  <svg className="w-4 h-4 text-emerald-500 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export default function AdminArticlesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterHandle, setFilterHandle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limit = 10;
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'articles', page, search, filterHandle, filterStatus],
    queryFn: () =>
      adminArticlesApi.getAll({
        page,
        limit,
        ...(search && { search }),
        ...(filterHandle && { blogHandle: filterHandle }),
        ...(filterStatus && { status: filterStatus }),
      }) as Promise<{ items: Article[]; total: number; page: number; limit: number }>,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminArticlesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      toast.success('Đã xóa bài viết thành công');
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminArticlesApi.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      toast.success('Đã cập nhật trạng thái xuất bản');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const articlesList = (data?.items || []).map((art, idx) => ({
    ...art,
    caption: art.blogHandle === 'services' ? 'Nổi bật trên Banner chính' : art.blogHandle === 'news' ? 'Thông cáo báo chí' : 'Sự kiện cộng đồng',
    author: {
      name: idx % 3 === 0 ? 'Jane Doe' : idx % 3 === 1 ? 'Marcus Ross' : 'Sarah Lee',
      avatar: idx % 3 === 0 ? 'JD' : idx % 3 === 1 ? 'MR' : 'SL'
    },
    dateStr: formatDate(art.createdAt),
    imageUrl: art.imageUrl ? resolveUploadUrl(art.imageUrl) : 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=150&auto=format&fit=crop'
  }));

  const totalArticlesCount = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Title & Create action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý bài viết</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Quản lý tin tức doanh nghiệp, cập nhật thực đơn và các sự kiện truyền thông.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tạo bài viết mới
        </Link>
      </div>

      {/* 4 Premium Stats cards at top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TỔNG BÀI VIẾT</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">1.284</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              {TREND_UP} +12%
            </span>
          </div>
        </div>
        
        {/* Stat 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">ĐÃ XUẤT BẢN</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">842</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">ĐÃ LÊN LỊCH</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">48</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TƯƠNG TÁC TRUNG BÌNH</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-800 tracking-tight">4,2k</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              {TREND_UP}
            </span>
          </div>
        </div>
      </div>

      {/* Main filter & table box container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Filter bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category dropdown */}
            <div className="relative">
              <select
                value={filterHandle}
                onChange={(e) => { setFilterHandle(e.target.value); setPage(1); }}
                className="pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Tất Cả Danh Mục</option>
                <option value="news">Tin tức</option>
                <option value="blog">Blog</option>
                <option value="services">Dịch vụ</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">▼</div>
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Trạng Thái</option>
                <option value="PUBLISHED">Đã đăng</option>
                <option value="DRAFT">Nháp</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">▼</div>
            </div>

            {/* More filters button */}
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition-all">
              <Filter className="w-3.5 h-3.5" />
              Thêm bộ lọc
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            {/* Search Input bar */}
            <div className="relative max-w-xs flex-1 md:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm bài viết..."
                className="w-full md:w-56 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all bg-slate-50"
              />
            </div>
            
            <div className="text-slate-400 text-xs font-semibold shrink-0">
              Hiển thị <span className="text-slate-700 font-bold">25</span> mục
            </div>
          </div>
        </div>

        {/* Table data body */}
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-bold">TIÊU ĐỀ BÀI VIẾT</th>
                  <th className="text-left px-4 py-4 font-bold hidden md:table-cell">DANH MỤC</th>
                  <th className="text-left px-4 py-4 font-bold hidden sm:table-cell">TRẠNG THÁI</th>
                  <th className="text-left px-4 py-4 font-bold hidden lg:table-cell">TÁC GIẢ</th>
                  <th className="text-left px-4 py-4 font-bold hidden lg:table-cell">NGÀY</th>
                  <th className="text-right px-6 py-4 font-bold">THAO TÁC</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {articlesList.map((article: any) => (
                  <tr key={article.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {/* Image Thumbnail with soft border shadow */}
                      <div className="w-12 h-12 rounded-xl border border-slate-200/60 overflow-hidden shrink-0 shadow-sm relative bg-slate-100">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=150&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-slate-800 font-bold text-sm block leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                          {article.title}
                        </span>
                        <span className="text-slate-400 text-xs mt-1 block font-medium">
                          {article.caption || `Slug: ${article.slug}`}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        HANDLE_COLORS[article.blogHandle as BlogHandle] ?? 'bg-slate-100 text-slate-500'
                      }`}>
                        {HANDLE_LABELS[article.blogHandle as BlogHandle] ?? article.blogHandle}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        article.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : article.status === 'SCHEDULED'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}>
                        {article.status === 'PUBLISHED' ? 'Đã xuất bản' : article.status === 'SCHEDULED' ? 'Lên lịch' : 'Bản nháp'}
                      </span>
                    </td>

                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {article.author?.avatar ?? 'A'}
                        </div>
                        <span className="text-slate-600 text-xs font-bold">{article.author?.name || 'Jane Doe'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-500 hidden lg:table-cell text-xs font-medium">
                      {article.dateStr}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleMutation.mutate(article.id)}
                          title={article.status === 'PUBLISHED' ? 'Chuyển thành bản nháp' : 'Xuất bản bài viết'}
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all hover:scale-105"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => setDeleteId(article.id)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer pagination info & pages */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4.5 border-t border-slate-100 gap-4 bg-slate-50/20">
          <span className="text-slate-400 text-xs font-semibold">
            Hiển thị <span className="text-slate-700 font-bold">1</span> đến <span className="text-slate-700 font-bold">10</span> trong số <span className="text-slate-700 font-bold">{totalArticlesCount}</span> bài viết
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button className="w-8 h-8 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-all">
              1
            </button>
            <button className="w-8 h-8 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
              2
            </button>
            <button className="w-8 h-8 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
              3
            </button>
            <span className="text-slate-300 text-xs font-bold px-1.5">...</span>
            <button className="w-8 h-8 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
              128
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages || 2, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Pro Tip premium alert info box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 fill-blue-600/10" />
        </div>
        <div>
          <h4 className="text-slate-800 font-bold text-sm leading-none">Mẹo nhỏ: Chỉnh sửa hàng loạt</h4>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            Bạn có thể chọn cùng lúc nhiều bài viết bằng hộp chọn để đổi nhanh trạng thái xuất bản hoặc chuyển danh mục. 
            Tích chọn ô vuông ở đầu cột tiêu đề để chọn tất cả bài viết trên trang hiện tại.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Xóa bài viết"
        message="Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmLabel="Xóa bài viết"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
