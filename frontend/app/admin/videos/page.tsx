'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Play,
  Plus,
  Search,
  Trash2,
  Save,
  X,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
  Check,
  Upload,
  AlertCircle,
  Pencil
} from 'lucide-react';
import {
  useVideosQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation
} from '@/hooks/useContentQueries';
import { adminMediaApi } from '@/lib/admin-api';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { resolveUploadUrl } from '@/lib/api';
import { toast } from '@/components/admin/Toast';

export default function AdminVideosPage() {
  const { data: videos = [], isLoading, error } = useVideosQuery();
  const createMutation = useCreateVideoMutation();
  const updateMutation = useUpdateVideoMutation();
  const deleteMutation = useDeleteVideoMutation();

  // View, search, and inline playing states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlayerVideo, setActivePlayerVideo] = useState<any | null>(null);

  // Deletion Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formChannelName, setFormChannelName] = useState('EXPRESS CAFE OFFICIAL');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Thumbnail Tab selection: 'youtube' | 'upload' | 'url'
  const [thumbnailSourceType, setThumbnailSourceType] = useState<'youtube' | 'upload' | 'url'>('youtube');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const parsedYoutubeId = useMemo(() => getYoutubeId(formYoutubeUrl), [formYoutubeUrl]);

  // Synchronize YouTube thumbnail if URL changes and sourceType is 'youtube'
  useEffect(() => {
    if (thumbnailSourceType === 'youtube' && parsedYoutubeId) {
      setFormThumbnailUrl(`https://img.youtube.com/vi/${parsedYoutubeId}/maxresdefault.jpg`);
    }
  }, [parsedYoutubeId, thumbnailSourceType]);

  // Handle YouTube URL input change
  const handleYoutubeUrlChange = (val: string) => {
    setFormYoutubeUrl(val);
    const yId = getYoutubeId(val);
    if (yId && thumbnailSourceType === 'youtube') {
      setFormThumbnailUrl(`https://img.youtube.com/vi/${yId}/maxresdefault.jpg`);
    }
  };

  // Filter videos
  const filteredVideos = useMemo(() => {
    let list = [...videos];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.channelName?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [videos, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = videos.length;
    const active = videos.filter((v) => v.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [videos]);

  // Reset form settings
  const resetForm = () => {
    setEditingVideoId(null);
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormThumbnailUrl('');
    setFormChannelName('EXPRESS CAFE OFFICIAL');
    setFormSortOrder(videos.length + 1);
    setFormIsActive(true);
    setThumbnailSourceType('youtube');
  };

  // Open Create Modal
  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (video: any) => {
    setEditingVideoId(video.id);
    setFormTitle(video.title);
    setFormYoutubeUrl(video.youtubeUrl);
    setFormThumbnailUrl(video.thumbnailUrl);
    setFormChannelName(video.channelName || 'EXPRESS CAFE OFFICIAL');
    setFormSortOrder(video.sortOrder || 1);
    setFormIsActive(video.isActive !== false);

    // Determine cover tab source
    if (video.thumbnailUrl?.includes('img.youtube.com')) {
      setThumbnailSourceType('youtube');
    } else if (video.thumbnailUrl?.startsWith('http')) {
      setThumbnailSourceType('url');
    } else {
      setThumbnailSourceType('upload');
    }

    setModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Tiêu đề video không được để trống');
      return;
    }
    if (!formYoutubeUrl.trim()) {
      toast.error('Đường dẫn video YouTube không được để trống');
      return;
    }
    if (!formThumbnailUrl.trim()) {
      toast.error('Ảnh bìa video không được để trống');
      return;
    }

    const payload = {
      title: formTitle,
      youtubeUrl: formYoutubeUrl,
      thumbnailUrl: formThumbnailUrl,
      channelName: formChannelName || 'EXPRESS CAFE OFFICIAL',
      sortOrder: Number(formSortOrder),
      isActive: formIsActive
    };

    try {
      if (editingVideoId) {
        await updateMutation.mutateAsync({ id: editingVideoId, data: payload });
        toast.success('Đã cập nhật thông tin video');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Đã thêm video mới thành công');
      }
      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi lưu thông tin video');
    }
  };

  // Deletion confirmed
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmId);
      toast.success('Đã xóa video thành công');
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi xóa video');
    }
  };

  // Local Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp tin hình ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh vượt quá giới hạn 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      if (res.cdnUrl) {
        setFormThumbnailUrl(res.cdnUrl);
        toast.success('Tải ảnh đại diện lên thành công');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chỉ kéo thả tệp tin hình ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh vượt quá giới hạn 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      if (res.cdnUrl) {
        setFormThumbnailUrl(res.cdnUrl);
        toast.success('Tải ảnh đại diện lên thành công');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-orange-500" />
            Quản lý Video Trang Chủ
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Quản trị danh sách các video YouTube hiển thị ở khu vực truyền thông trang chủ.
          </p>
        </div>
        <div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" /> Thêm Video Mới
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số video</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.active}</h3>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-slate-100 rounded-2xl text-slate-500">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Tạm ẩn</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.inactive}</h3>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter & Controls */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề hoặc tên kênh..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex border border-slate-200 bg-white rounded-xl overflow-hidden self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-slate-100 text-orange-500' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Dạng lưới thẻ YouTube"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-slate-100 text-orange-500' : 'text-slate-400 hover:text-slate-605'
            }`}
            title="Dạng bảng chi tiết"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Videos Data List */}
      {isLoading ? (
        <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
          <TableSkeleton rows={3} cols={5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center">
          <p className="text-red-500 font-bold">Lỗi tải danh sách video: {error.message}</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl shadow-sm max-w-md mx-auto">
          <Play className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <h4 className="text-slate-700 font-bold text-lg">Không tìm thấy video nào</h4>
          <p className="text-slate-400 text-xs mt-1.5 px-6 leading-relaxed">
            Chưa có video nào hoặc các video hiện tại không khớp với từ khóa tìm kiếm.
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tạo video đầu tiên
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW (YOUTUBE CARDS LAYOUT) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const yId = getYoutubeId(video.youtubeUrl);
            return (
              <div
                key={video.id}
                className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group duration-300 flex flex-col h-full"
              >
                {/* 16:9 Image Preview container */}
                <div
                  onClick={() => setActivePlayerVideo(video)}
                  className="relative aspect-[16/9] bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-100 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveUploadUrl(video.thumbnailUrl)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  {/* Glassmorphic Play button overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:scale-110 active:scale-95 transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  
                  {/* Sort Order Badges */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10">
                    Thứ tự: {video.sortOrder}
                  </span>
                </div>

                {/* Info & Settings Block */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                  <div>
                    <h4
                      onClick={() => openEditModal(video)}
                      className="font-extrabold text-slate-800 text-sm leading-snug hover:text-orange-500 transition-colors cursor-pointer line-clamp-2"
                    >
                      {video.title}
                    </h4>
                    <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider">
                      Kênh: {video.channelName}
                    </p>
                  </div>

                  {/* Actions & Status */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                    {/* Toggle status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      video.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${video.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350'}`} />
                      {video.isActive ? 'Đang chiếu' : 'Tạm ẩn'}
                    </span>

                    {/* Options Actions */}
                    <div className="flex items-center gap-1">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Xem trên Youtube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(video.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Xóa video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">Thứ tự</th>
                  <th className="py-4 px-6 w-32">Ảnh bìa</th>
                  <th className="py-4 px-6">Tiêu đề video</th>
                  <th className="py-4 px-6 w-44">Tên kênh</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-slate-400">
                      {video.sortOrder}
                    </td>
                    <td className="py-4 px-6">
                      <div
                        onClick={() => setActivePlayerVideo(video)}
                        className="relative w-24 aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveUploadUrl(video.thumbnailUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=100&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-current drop-shadow" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 hover:text-orange-500 cursor-pointer transition-colors" onClick={() => openEditModal(video)}>
                        {video.title}
                      </div>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-wider mt-1 transition-all"
                      >
                        Youtube Link <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-500">
                      {video.channelName}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {video.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-extrabold">
                          Tạm ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(video.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
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
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-up">
            
            {/* Left Panel: Form Settings */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[90vh] md:max-h-[85vh] border-r border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-slate-850">
                  {editingVideoId ? 'Chỉnh Sửa Video' : 'Thêm Video Mới'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tiêu đề Video</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Giải mã bí quyết chốt đơn của Express Cafe..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-800 placeholder:text-slate-400 text-sm"
                    required
                  />
                </div>

                {/* Youtube URL and Channel Name side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Liên kết YouTube *</label>
                    <input
                      type="text"
                      value={formYoutubeUrl}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-800 placeholder:text-slate-400 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tên Kênh YouTube</label>
                    <input
                      type="text"
                      value={formChannelName}
                      onChange={(e) => setFormChannelName(e.target.value)}
                      placeholder="VD: EXPRESS CAFE OFFICIAL"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-755 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload Source Type tab */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ảnh bìa video (Thumbnail)</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold max-w-sm mb-3">
                    <button
                      type="button"
                      onClick={() => setThumbnailSourceType('youtube')}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        thumbnailSourceType === 'youtube' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Lấy từ Youtube
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailSourceType('upload')}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        thumbnailSourceType === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Tải lên từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailSourceType('url')}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        thumbnailSourceType === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Nhập Link URL
                    </button>
                  </div>

                  {thumbnailSourceType === 'youtube' ? (
                    /* Auto Youtube Cover display description */
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                      <ImageIcon className="w-6 h-6 text-slate-400 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-600">Trình trích xuất ảnh tự động</p>
                        <p className="text-slate-400 mt-0.5 leading-normal">
                          Ảnh bìa sẽ được đồng bộ trực tiếp từ máy chủ YouTube dựa trên mã video phía trên.
                        </p>
                      </div>
                    </div>
                  ) : thumbnailSourceType === 'upload' ? (
                    /* Local drag & drop file uploader */
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-250 rounded-2xl p-6 text-center hover:border-orange-500 hover:bg-orange-50/10 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden"
                    >
                      <input
                        key="videos-thumbnail-upload-input"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="space-y-2">
                          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                          <p className="text-slate-500 text-xs font-bold">Đang tải ảnh đại diện lên hệ thống...</p>
                        </div>
                      ) : formThumbnailUrl && !formThumbnailUrl.includes('youtube.com') ? (
                        <div className="space-y-3 w-full">
                          <div className="relative mx-auto w-32 aspect-[16/9] rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveUploadUrl(formThumbnailUrl)}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đã tải lên ảnh bìa tùy chỉnh. Nhấp để đổi.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-slate-400 group-hover:text-orange-500 group-hover:scale-105 transition-all mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-slate-600">
                              Kéo thả hình ảnh vào đây, hoặc <span className="text-orange-500 hover:underline">duyệt tệp</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Hỗ trợ JPG, PNG, WEBP, GIF tối đa 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual input URL */
                    <div className="relative">
                      <input
                        key="videos-thumbnail-url-input"
                        type="text"
                        value={formThumbnailUrl}
                        onChange={(e) => setFormThumbnailUrl(e.target.value)}
                        placeholder="https://domain.com/path-to-image.png"
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-mono text-xs text-slate-700"
                      />
                      {formThumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setFormThumbnailUrl('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority Sort and Status switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Thứ tự ưu tiên hiển thị</label>
                    <input
                      type="number"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-700 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trạng thái công khai</label>
                    <select
                      value={formIsActive ? 'true' : 'false'}
                      onChange={(e) => setFormIsActive(e.target.value === 'true')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-700 text-sm"
                    >
                      <option value="true">Hiển thị công khai (Active)</option>
                      <option value="false">Tạm ẩn trên trang chủ (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-50 cursor-pointer"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> Lưu Video
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Panel: Simulated Live Preview */}
            <div className="hidden md:flex md:w-[320px] lg:w-[380px] bg-slate-900 text-white p-6 flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-400 uppercase tracking-wider">
                  <Eye className="w-4 h-4" /> Xem Thử Trình Phát
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Mô phỏng trình phát của video trên website. Nếu bạn nhập link YouTube chính xác, video sẽ tải được trình phát trực quan dưới đây.
                </p>
              </div>

              {/* Simulated Embedded Player */}
              <div className="my-auto py-6">
                {parsedYoutubeId ? (
                  <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${parsedYoutubeId}`}
                      title="YouTube video player"
                      className="absolute inset-0 w-full h-full border-none z-10"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] border-2 border-dashed border-slate-700 bg-slate-850 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                    <Play className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chưa có liên kết video hợp lệ</span>
                  </div>
                )}
              </div>

              {/* Status details */}
              <div className="text-[10px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Vị trí hiển thị:</span>
                  <span className="text-slate-400 font-bold">Khu truyền thông trang chủ</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái hoạt động:</span>
                  <span className={formIsActive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {formIsActive ? 'Bật công khai' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DETAILED PLAY VIDEO OVERLAY MODAL */}
      {activePlayerVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl animate-scale-up">
            
            {/* Header details */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-white line-clamp-1">{activePlayerVideo.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Kênh: {activePlayerVideo.channelName}</p>
              </div>
              <button
                onClick={() => setActivePlayerVideo(null)}
                className="p-1.5 hover:bg-slate-850 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative w-full aspect-[16/9] bg-black">
              {getYoutubeId(activePlayerVideo.youtubeUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(activePlayerVideo.youtubeUrl)}?autoplay=1`}
                  title={activePlayerVideo.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle className="w-12 h-12 mb-2 text-rose-500" />
                  <p className="text-xs font-bold">Không thể tải trình phát. Link YouTube bị lỗi.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-4 border border-rose-100">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            
            <h4 className="text-base font-extrabold text-slate-800">Xác Nhận Xóa Video</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-semibold">
              Hành động này sẽ xóa vĩnh viễn video truyền thông khỏi cơ sở dữ liệu SQLite. Bạn có chắc muốn tiếp tục?
            </p>
            
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-rose-500/10"
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
