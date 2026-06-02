'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Save, X, Pencil, Plus, ToggleLeft, ToggleRight, ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
import { adminBannersApi } from '@/lib/admin-api';
import { StatCardSkeleton } from '@/components/admin/Skeleton';
import { toast } from '@/components/admin/Toast';

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // States for inline editing
  const [editTitle, setEditTitle] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');

  // Fetch banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: () => adminBannersApi.getAll() as Promise<any[]>,
  });

  // Sort banners by sortOrder or order locally
  const sortedBanners = [...banners].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0));

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminBannersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã cập nhật banner');
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi cập nhật banner'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      adminBannersApi.update(id, { isActive: !currentActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã cập nhật trạng thái hiển thị');
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi thay đổi trạng thái'),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => adminBannersApi.reorder(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã thay đổi thứ tự hiển thị');
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi sắp xếp thứ tự'),
  });

  const startEdit = (banner: any) => {
    setEditingId(banner.id);
    setEditTitle(banner.title);
    setEditImageUrl(banner.imageUrl);
    setEditLinkUrl(banner.linkUrl ?? banner.subtitle ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }
    if (!editImageUrl.trim()) {
      toast.error('URL hình ảnh không được để trống');
      return;
    }
    updateMutation.mutate({
      id,
      payload: {
        title: editTitle,
        imageUrl: editImageUrl,
        linkUrl: editLinkUrl || undefined,
        // Also support 'subtitle' field just in case
        subtitle: editLinkUrl || undefined,
      },
    });
  };

  // Move banner Up or Down
  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === sortedBanners.length - 1) return;

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const reorderedList = [...sortedBanners];

    // Swap sortOrder
    const currentOrder = reorderedList[index].sortOrder ?? reorderedList[index].order ?? 0;
    const targetOrder = reorderedList[targetIndex].sortOrder ?? reorderedList[targetIndex].order ?? 0;

    reorderedList[index].sortOrder = targetOrder;
    reorderedList[index].order = targetOrder;
    reorderedList[targetIndex].sortOrder = currentOrder;
    reorderedList[targetIndex].order = currentOrder;

    // Send updated order to server
    const payload = reorderedList.map((banner) => ({
      id: banner.id,
      order: banner.sortOrder ?? banner.order ?? 0,
    }));

    reorderMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý Slideshow Banner</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">Cấu hình các banner quảng cáo chạy trên trang chủ khách hàng</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : sortedBanners.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse text-slate-350" />
          <p className="text-sm font-semibold">Chưa có banner slide nào chạy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedBanners.map((banner: any, index: number) => {
            const isEditing = editingId === banner.id;
            return (
              <div
                key={banner.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-500/20 transition-all flex flex-col group shadow-sm hover:shadow-lg"
              >
                {/* Image preview banner */}
                <div className="relative aspect-[21/9] bg-slate-100 overflow-hidden border-b border-slate-150 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isEditing ? editImageUrl : banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-4">
                    {!isEditing && (
                      <>
                        <h4 className="text-white font-bold text-base line-clamp-1">{banner.title}</h4>
                        {(banner.linkUrl || banner.subtitle) && (
                          <p className="text-orange-400 text-xs mt-1 flex items-center gap-1 font-semibold">
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{banner.linkUrl ?? banner.subtitle}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    Thứ tự: {banner.sortOrder ?? banner.order ?? 0}
                  </span>
                </div>

                {/* Content info & forms */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      {/* Edit Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tiêu đề lớn</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Nhập tiêu đề banner..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 text-sm font-semibold"
                        />
                      </div>
                      
                      {/* Edit Image URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Đường dẫn ảnh (URL)</label>
                        <input
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 text-sm font-mono"
                        />
                      </div>

                      {/* Edit Link URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Đường dẫn liên kết / Subtitle</label>
                        <input
                          value={editLinkUrl}
                          onChange={(e) => setEditLinkUrl(e.target.value)}
                          placeholder="Ví dụ: /promotions..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 text-sm font-semibold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      {/* Toggle status switch */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMutation.mutate({ id: banner.id, currentActive: banner.isActive })}
                          className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          {banner.isActive ? (
                            <ToggleRight className="w-9 h-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-9 h-6 text-slate-350" />
                          )}
                        </button>
                        <span className={`text-xs font-bold ${banner.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {banner.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>

                      {/* Sorting orders */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleMove(index, 'UP')}
                          disabled={index === 0}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'DOWN')}
                          disabled={index === sortedBanners.length - 1}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="pt-2.5 border-t border-slate-150 flex items-center justify-end gap-2.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Hủy
                        </button>
                        <button
                          onClick={() => saveEdit(banner.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
                        >
                          {updateMutation.isPending ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Lưu
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(banner)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
