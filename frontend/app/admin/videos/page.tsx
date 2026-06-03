'use client';

import { useState } from 'react';
import { Play, Plus, Search, Edit, Trash2, Save, X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useVideosQuery, useCreateVideoMutation, useUpdateVideoMutation, useDeleteVideoMutation } from '@/hooks/useContentQueries';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { resolveUploadUrl } from '@/lib/api';

export default function AdminVideosPage() {
  const { data: videos, isLoading, error } = useVideosQuery();
  const createMutation = useCreateVideoMutation();
  const updateMutation = useUpdateVideoMutation();
  const deleteMutation = useDeleteVideoMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form states for Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredVideos = (videos || []).filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.channelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      } catch (err) {
        console.error('Error deleting video:', err);
      }
    }
  };

  const openAddModal = () => {
    setEditingVideoId(null);
    setTitle('');
    setYoutubeUrl('');
    setThumbnailUrl('');
    setChannelName('');
    setSortOrder((videos?.length || 0) + 1);
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (video: any) => {
    setEditingVideoId(video.id);
    setTitle(video.title);
    setYoutubeUrl(video.youtubeUrl);
    setThumbnailUrl(video.thumbnailUrl);
    setChannelName(video.channelName);
    setSortOrder(video.sortOrder || 1);
    setIsActive(video.isActive !== false);
    setFormError(null);
    setModalOpen(true);
  };

  // Helper to extract YouTube video ID from URL for live preview
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Automatically update preview thumbnail if url changes and thumbnail is empty
  const handleYoutubeUrlChange = (val: string) => {
    setYoutubeUrl(val);
    if (!thumbnailUrl.trim()) {
      const yId = getYoutubeId(val);
      if (yId) {
        setThumbnailUrl(`https://img.youtube.com/vi/${yId}/maxresdefault.jpg`);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Tiêu đề video không được để trống.');
      return;
    }

    if (!youtubeUrl.trim()) {
      setFormError('Đường dẫn YouTube không được để trống.');
      return;
    }

    if (!thumbnailUrl.trim()) {
      setFormError('Hình ảnh đại diện (thumbnail) không được để trống.');
      return;
    }

    const payload = {
      title,
      youtubeUrl,
      thumbnailUrl,
      channelName: channelName || 'EXPRESS CAFE OFFICIAL',
      sortOrder: Number(sortOrder),
      isActive,
    };

    try {
      if (editingVideoId) {
        await updateMutation.mutateAsync({ id: editingVideoId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Có lỗi xảy ra khi lưu video.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý Video Trang Chủ</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Quản trị danh sách các video YouTube hiển thị ở khu vực truyền thông trang chủ
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer select-none"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm video mới
        </button>
      </div>

      {/* 2. Controls & Filters Row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm video theo tiêu đề hoặc kênh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
        
        {/* Count */}
        <div className="flex gap-4 items-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng số: <span className="text-slate-700">{filteredVideos.length}</span>
          </span>
        </div>
      </div>

      {/* 3. Main List Data Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
          <TableSkeleton rows={3} cols={5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
          <p className="text-red-500 font-semibold">Lỗi tải danh sách video: {error.message}</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center">
          <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-extrabold text-base text-slate-800">Không tìm thấy video nào</h3>
          <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc tạo video mới.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-32">Ảnh bìa</th>
                  <th className="px-6 py-4">Tiêu đề video</th>
                  <th className="px-6 py-4 w-40">Tên Kênh</th>
                  <th className="px-6 py-4 w-24">Thứ tự</th>
                  <th className="px-6 py-4 w-32">Trạng thái</th>
                  <th className="px-6 py-4 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredVideos.map((video) => {
                  const resolvedImg = resolveUploadUrl(video.thumbnailUrl);

                  return (
                    <tr key={video.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative w-20 aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
                          <img
                            src={resolvedImg}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=100&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current drop-shadow-md" />
                          </div>
                        </div>
                      </td>

                      {/* Title & Youtube Link */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => openEditModal(video)}>
                          {video.title}
                        </div>
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-wider mt-1 transition-all"
                        >
                          Xem trên Youtube <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      {/* Channel Name */}
                      <td className="px-6 py-4 text-slate-500 font-bold">
                        {video.channelName}
                      </td>

                      {/* Sort Order */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {video.sortOrder}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          video.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${video.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {video.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(video)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all active:scale-95 cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(video.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all active:scale-95 cursor-pointer"
                            title="Xóa video"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Edit/Create Modal Panel */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col justify-between animate-in scale-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                {editingVideoId ? 'Chỉnh sửa Video' : 'Thêm Video Mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl text-xs font-semibold leading-relaxed">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Tiêu đề Video *
                </label>
                <input
                  type="text"
                  placeholder="VD: Giải mã bí quyết chốt đơn..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold"
                />
              </div>

              {/* Youtube Url */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Đường dẫn YouTube Video *
                </label>
                <input
                  type="text"
                  placeholder="VD: https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium"
                />
              </div>

              {/* Channel Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Tên Kênh YouTube *
                </label>
                <input
                  type="text"
                  placeholder="VD: EXPRESS CAFE OFFICIAL"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold"
                />
              </div>

              {/* Image Thumbnail Url */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Đường dẫn ảnh đại diện (Thumbnail URL) *
                </label>
                <input
                  type="text"
                  placeholder="VD: uploads/videos/file.png hoặc URL tự động..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium"
                />
              </div>

              {/* Sort Order & Display Status row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold"
                  />
                </div>

                {/* Display Status */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Hiển thị trang chủ
                  </label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-semibold"
                  >
                    <option value="true">Hiển thị (Active)</option>
                    <option value="false">Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview block */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Xem trước ảnh bìa</span>
                {thumbnailUrl.trim() ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center">
                    <img
                      src={resolveUploadUrl(thumbnailUrl)}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 py-6">
                    <Play className="w-8 h-8 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Chưa nhập ảnh</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-base font-extrabold text-slate-800 mb-2">Xác nhận xóa Video?</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
              Hành động này không thể hoàn tác. Video này sẽ bị xóa khỏi hệ thống cơ sở dữ liệu.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
