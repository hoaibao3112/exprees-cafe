'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  Upload,
  Calendar,
  Check,
  AlertCircle,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
  Clock
} from 'lucide-react';
import { adminBannersApi, adminMediaApi } from '@/lib/admin-api';
import { resolveAssetUrl } from '@/lib/api-config';
import { StatCardSkeleton } from '@/components/admin/Skeleton';
import { toast } from '@/components/admin/Toast';

export default function AdminBannersPage() {
  const qc = useQueryClient();

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  // Modal / Drawer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  // Deletion Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formPosition, setFormPosition] = useState('HOME_HERO');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formEndsAt, setFormEndsAt] = useState('');
  
  // Image Upload Type: 'local' | 'url'
  const [imageSourceType, setImageSourceType] = useState<'local' | 'url'>('local');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: () => adminBannersApi.getAll() as Promise<any[]>,
  });

  // Helper date format conversions
  const formatDateForInput = (dateStr?: string | Date | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Sort & Filter Banners
  const filteredBanners = useMemo(() => {
    let list = [...banners];

    // Filter by position
    if (positionFilter !== 'ALL') {
      if (positionFilter === 'PAGE_HERO') {
        list = list.filter((b) => b.position.endsWith('_HERO') && b.position !== 'HOME_HERO');
      } else {
        list = list.filter((b) => b.position === positionFilter);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.linkUrl?.toLowerCase().includes(q)
      );
    }

    // Sort by sortOrder
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [banners, positionFilter, searchQuery]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => adminBannersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã thêm banner mới thành công');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi tạo banner'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminBannersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã cập nhật banner');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi cập nhật banner'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminBannersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success('Đã xóa banner thành công');
      setDeleteConfirmId(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi xóa banner'),
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
      toast.success('Đã sắp xếp thứ tự hiển thị');
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi sắp xếp thứ tự'),
  });

  // Reordering handler
  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === filteredBanners.length - 1) return;

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const reorderedList = [...filteredBanners];

    // Swap sortOrder
    const currentOrder = reorderedList[index].sortOrder ?? 0;
    const targetOrder = reorderedList[targetIndex].sortOrder ?? 0;

    reorderedList[index].sortOrder = targetOrder;
    reorderedList[targetIndex].sortOrder = currentOrder;

    const payload = reorderedList.map((banner) => ({
      id: banner.id,
      order: banner.sortOrder ?? 0,
    }));

    reorderMutation.mutate(payload);
  };

  // Form Reset
  const resetForm = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormPosition('HOME_HERO');
    setFormImageUrl('');
    setFormLinkUrl('');
    setFormIsActive(true);
    setFormStartsAt('');
    setFormEndsAt('');
    setImageSourceType('local');
  };

  // Open Creation Modal
  const openCreateModal = () => {
    resetForm();
    // Pre-populate position select dropdown based on current tab filter
    if (positionFilter === 'POPUP') {
      setFormPosition('POPUP');
    } else if (positionFilter === 'PAGE_HERO') {
      setFormPosition('ABOUT_HERO');
    } else if (positionFilter === 'HOME_HERO') {
      setFormPosition('HOME_HERO');
    }
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setFormTitle(banner.title || '');
    setFormPosition(banner.position || 'HOME_HERO');
    setFormImageUrl(banner.imageUrl || '');
    setFormLinkUrl(banner.linkUrl ?? banner.subtitle ?? '');
    setFormIsActive(banner.isActive !== false);
    setFormStartsAt(formatDateForInput(banner.startsAt));
    setFormEndsAt(formatDateForInput(banner.endsAt));
    setImageSourceType(banner.imageUrl?.startsWith('http') && !banner.imageUrl?.includes('localhost') ? 'url' : 'local');
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }
    if (!formImageUrl.trim()) {
      toast.error('Ảnh banner không được để trống');
      return;
    }

    const payload = {
      title: formTitle,
      position: formPosition,
      imageUrl: formImageUrl,
      linkUrl: formLinkUrl || null,
      isActive: formIsActive,
      startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : null,
      endsAt: formEndsAt ? new Date(formEndsAt).toISOString() : null,
    };

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Local Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // File validation
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chỉ upload tệp tin hình ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      if (res.cdnUrl) {
        setFormImageUrl(res.cdnUrl);
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error('Không tìm thấy đường dẫn ảnh sau khi tải lên');
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
      toast.error('Vui lòng chỉ upload tệp tin hình ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      if (res.cdnUrl) {
        setFormImageUrl(res.cdnUrl);
        toast.success('Tải ảnh lên thành công');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const total = banners.length;
    const active = banners.filter(b => b.isActive).length;
    const scheduled = banners.filter(b => {
      if (!b.startsAt && !b.endsAt) return false;
      const startValid = !b.startsAt || new Date(b.startsAt) <= now;
      const endValid = !b.endsAt || new Date(b.endsAt) >= now;
      return b.isActive && startValid && endValid;
    }).length;
    
    return { total, active, scheduled };
  }, [banners]);

  // Check if a banner is currently expired
  const getBannerScheduleStatus = (banner: any) => {
    if (!banner.isActive) return 'inactive';
    const now = new Date();
    if (banner.startsAt && new Date(banner.startsAt) > now) return 'scheduled';
    if (banner.endsAt && new Date(banner.endsAt) < now) return 'expired';
    return 'active';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-orange-500" />
            Quản lý Slideshow Banner
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Thiết kế & cấu hình các slide chạy ở trang chủ hoặc banner popup quảng cáo.
          </p>
        </div>
        <div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Banner Mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số Banner</p>
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
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Đang hiển thị thực tế</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.scheduled}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm banner theo tên, link..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setPositionFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                positionFilter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setPositionFilter('HOME_HERO')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                positionFilter === 'HOME_HERO'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Slideshow
            </button>
            <button
              onClick={() => setPositionFilter('PAGE_HERO')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                positionFilter === 'PAGE_HERO'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Banner Trang
            </button>
            <button
              onClick={() => setPositionFilter('POPUP')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                positionFilter === 'POPUP'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Popup
            </button>
          </div>

          {/* View Modes */}
          <div className="flex border border-slate-200 bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 text-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng lưới card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-slate-100 text-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dạng bảng chi tiết"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Đang tải danh sách banner...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl shadow-sm max-w-md mx-auto">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <h4 className="text-slate-700 font-bold text-lg">Không tìm thấy banner nào</h4>
          <p className="text-slate-400 text-xs mt-1.5 px-6 leading-relaxed">
            Chưa có banner nào được tạo hoặc không có banner nào khớp với bộ lọc hiện tại. Nhấp vào nút thêm mới để tạo banner.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 px-4.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tạo banner đầu tiên
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner, index) => {
            const status = getBannerScheduleStatus(banner);
            return (
              <div
                key={banner.id}
                className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group duration-300 flex flex-col h-full"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-[21/9] bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(banner.imageUrl)}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Overlay background for title visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10">
                      Vị trí: {banner.position === 'POPUP' ? 'Popup' : 'Slideshow'}
                    </span>
                    
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/10">
                      Thứ tự: {banner.sortOrder ?? 0}
                    </span>

                    <h4 className="text-white font-extrabold text-sm line-clamp-1 leading-snug">{banner.title}</h4>
                    {banner.linkUrl && (
                      <p className="text-orange-400 text-[10px] mt-1 flex items-center gap-1 font-bold">
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{banner.linkUrl}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                  {/* Date Schedule Tag */}
                  {(banner.startsAt || banner.endsAt) && (
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        {banner.startsAt && `Bắt đầu: ${new Date(banner.startsAt).toLocaleDateString('vi-VN')}`}
                        {banner.startsAt && banner.endsAt && ' - '}
                        {banner.endsAt && `Hết hạn: ${new Date(banner.endsAt).toLocaleDateString('vi-VN')}`}
                      </div>
                    </div>
                  )}

                  {/* Status switches and Ordering */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: banner.id, currentActive: banner.isActive })}
                        className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title={banner.isActive ? 'Tạm dừng hiển thị' : 'Kích hoạt hiển thị'}
                      >
                        {banner.isActive ? (
                          <ToggleRight className="w-9 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-9 h-6 text-slate-350" />
                        )}
                      </button>
                      
                      <div className="flex flex-col">
                        <span className={`text-xs font-black ${banner.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {banner.isActive ? 'Bật' : 'Tắt'}
                        </span>
                        {banner.isActive && (
                          <span className="text-[9px] font-bold text-slate-400">
                            {status === 'active' && 'Đang chạy'}
                            {status === 'scheduled' && 'Đang chờ'}
                            {status === 'expired' && 'Đã hết hạn'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Move Priority buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMove(index, 'UP')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Di chuyển lên đầu"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'DOWN')}
                        disabled={index === filteredBanners.length - 1}
                        className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="Di chuyển xuống cuối"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5">
                    <button
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                      title="Xóa banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openEditModal(banner)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">Thứ tự</th>
                  <th className="py-4 px-6">Ảnh Banner</th>
                  <th className="py-4 px-6">Tiêu đề</th>
                  <th className="py-4 px-6">Vị trí</th>
                  <th className="py-4 px-6">Đường dẫn Link</th>
                  <th className="py-4 px-6">Lịch trình hiển thị</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredBanners.map((banner, index) => {
                  const status = getBannerScheduleStatus(banner);
                  return (
                    <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-slate-400">
                        {banner.sortOrder ?? 0}
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative w-24 aspect-[21/9] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveAssetUrl(banner.imageUrl)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {banner.title}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          banner.position === 'POPUP' 
                            ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                            : banner.position === 'HOME_HERO'
                            ? 'bg-orange-50 text-orange-600 border border-orange-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {banner.position === 'POPUP' 
                            ? 'Popup' 
                            : banner.position === 'HOME_HERO'
                            ? 'Slideshow' 
                            : 'Banner Trang'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-xs truncate">
                        {banner.linkUrl || '-'}
                      </td>
                      <td className="py-4 px-6 text-xs font-medium text-slate-500">
                        {banner.startsAt || banner.endsAt ? (
                          <div className="flex flex-col gap-0.5">
                            {banner.startsAt && (
                              <span>Từ: {new Date(banner.startsAt).toLocaleString('vi-VN')}</span>
                            )}
                            {banner.endsAt && (
                              <span>Đến: {new Date(banner.endsAt).toLocaleString('vi-VN')}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Luôn hiển thị</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => toggleMutation.mutate({ id: banner.id, currentActive: banner.isActive })}
                            className="cursor-pointer"
                          >
                            {banner.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-extrabold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-extrabold">
                                Tạm dừng
                              </span>
                            )}
                          </button>
                          
                          {banner.isActive && status !== 'active' && (
                            <span className={`text-[9px] font-extrabold uppercase ${
                              status === 'scheduled' ? 'text-blue-500' : 'text-rose-500'
                            }`}>
                              {status === 'scheduled' ? 'Chờ kích hoạt' : 'Hết hạn'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleMove(index, 'UP')}
                            disabled={index === 0}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-500 cursor-pointer"
                            title="Lên"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'DOWN')}
                            disabled={index === filteredBanners.length - 1}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-500 cursor-pointer"
                            title="Xuống"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(banner)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(banner.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
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

      {/* CREATE & EDIT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-up">
            
            {/* Left Panel: Form Settings */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[90vh] md:max-h-[85vh] border-r border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold text-slate-850">
                  {editingBanner ? 'Cập Nhật Banner' : 'Tạo Mới Banner'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-605 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tiêu đề Banner</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Khởi đầu ngày mới tỉnh thức..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-800 placeholder:text-slate-400 text-sm"
                    required
                  />
                </div>

                {/* Position and Link side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vị trí hiển thị</label>
                    <select
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-700 text-sm"
                    >
                      <option value="HOME_HERO">Slideshow chính (Homepage)</option>
                      <option value="ABOUT_HERO">Banner trang Giới thiệu (About)</option>
                      <option value="FRANCHISE_HERO">Banner trang Nhượng quyền (Franchise)</option>
                      <option value="SERVICES_HERO">Banner trang Dịch vụ (Services)</option>
                      <option value="BRANCHES_HERO">Banner trang Chi nhánh (Branches)</option>
                      <option value="BLOG_HERO">Banner trang Tin tức (Blog)</option>
                      <option value="PROMOTIONS_HERO">Banner trang Khuyến mãi (Promotions)</option>
                      <option value="CONTACT_HERO">Banner trang Liên hệ (Contact)</option>
                      <option value="POPUP">Popup quảng cáo nổi</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Đường dẫn liên kết (Link)</label>
                    <input
                      type="text"
                      value={formLinkUrl}
                      onChange={(e) => setFormLinkUrl(e.target.value)}
                      placeholder="/promotions hoặc https://..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold text-slate-700 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                </div>

                {/* Image Upload Source Type tab */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hình ảnh Banner</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold max-w-xs mb-3">
                    <button
                      type="button"
                      onClick={() => setImageSourceType('local')}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        imageSourceType === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Tải ảnh lên từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('url')}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        imageSourceType === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Đường dẫn URL
                    </button>
                  </div>

                  {imageSourceType === 'local' ? (
                    /* Local drag & drop file uploader */
                    <div
                      key="uploader-local"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-250 rounded-2xl p-6 text-center hover:border-orange-500 hover:bg-orange-50/10 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="space-y-2">
                          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                          <p className="text-slate-500 text-xs font-bold">Đang truyền tải hình ảnh lên hệ thống...</p>
                        </div>
                      ) : formImageUrl ? (
                        <div className="space-y-3 w-full">
                          <div className="relative mx-auto w-32 aspect-[21/9] rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveAssetUrl(formImageUrl)}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đã tải lên ảnh. Nhấp để thay đổi.
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
                    <div key="uploader-url" className="relative">
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-mono text-xs text-slate-700"
                      />
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Date scheduling range controls */}
                <div className="space-y-2 pt-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lịch hiển thị tự động (Không bắt buộc)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Thời điểm bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={formStartsAt}
                        onChange={(e) => setFormStartsAt(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">Thời điểm kết thúc</label>
                      <input
                        type="datetime-local"
                        value={formEndsAt}
                        onChange={(e) => setFormEndsAt(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal font-medium">
                    Nếu thiết lập lịch, banner sẽ chỉ hiển thị tự động trên trang chủ trong khoảng thời gian đã chọn. Ngoài khoảng thời gian này sẽ tự ẩn.
                  </p>
                </div>

                {/* Active status */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Kích hoạt hiển thị</label>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      Cho phép banner được đưa vào danh sách kiểm duyệt hiển thị
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className="text-slate-400 focus:outline-none cursor-pointer"
                  >
                    {formIsActive ? (
                      <ToggleRight className="w-10 h-7 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-7 text-slate-350" />
                    )}
                  </button>
                </div>

                {/* Buttons Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                        <Save className="w-3.5 h-3.5" /> Lưu Banner
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
                  <Eye className="w-4 h-4" /> Xem thử thực tế (Live Preview)
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Mô phỏng hiển thị thực tế của banner trên trang chủ khách hàng. Tiêu đề sẽ tự động tách chữ đầu để đổi màu làm nổi bật thương hiệu.
                </p>
              </div>

              {/* Simulated Rendering */}
              <div className="my-auto py-6">
                {formPosition === 'POPUP' ? (
                  /* POPUP PREVIEW */
                  <div className="relative mx-auto max-w-[240px] bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden aspect-[3/4] flex flex-col justify-between p-4">
                    {/* Simulated close btn */}
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-bold cursor-pointer text-slate-400">
                      ×
                    </div>
                    {formImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={resolveAssetUrl(formImageUrl)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-0">
                        <ImageIcon className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                    {/* popup gradient content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                    
                    <div className="z-20 mt-auto space-y-2">
                      <span className="bg-orange-500 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                        QUẢNG CÁO MỚI
                      </span>
                      <h5 className="font-extrabold text-xs text-white leading-tight drop-shadow">
                        {formTitle || 'Tiêu đề popup sẽ hiển thị ở đây'}
                      </h5>
                      <button type="button" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider py-1.5 rounded-full mt-1.5 pointer-events-none">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ) : (
                  /* HERO SLIDESHOW PREVIEW */
                  <div className="relative w-full aspect-[21/9] bg-slate-950 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col justify-center items-center text-center p-3">
                    {formImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={resolveAssetUrl(formImageUrl)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-0">
                        <ImageIcon className="w-12 h-12 text-slate-700" />
                      </div>
                    )}
                    {/* shadow gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 z-10 pointer-events-none" />

                    <div className="z-20 space-y-1 max-w-[90%]">
                      <span className="inline-block text-[7px] font-bold text-orange-400 tracking-wider uppercase border border-orange-500/20 bg-orange-950/30 px-2 py-0.5 rounded-full">
                        ★ EXPRESS CAFE OFFICIAL
                      </span>
                      
                      <h5 className="text-[11px] font-black uppercase text-white leading-none drop-shadow">
                        <span className="text-white">{(formTitle || 'TIÊU ĐỀ SLIDESHOW').split(' ')[0]} </span>
                        <span className="text-orange-500">{(formTitle || 'TIÊU ĐỀ SLIDESHOW').split(' ').slice(1).join(' ')}</span>
                      </h5>
                      
                      <p className="text-[7px] text-slate-300 font-light truncate leading-normal">
                        {formLinkUrl ? `Đường dẫn: ${formLinkUrl}` : 'Hương vị truyền thống kết hợp công nghệ hiện đại'}
                      </p>
                      
                      <button type="button" className="inline-block bg-orange-500 text-[7px] font-extrabold uppercase px-3 py-1 rounded-full text-white pointer-events-none">
                        Đăng Ký Tư Vấn
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status information */}
              <div className="text-[10px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Trạng thái hoạt động:</span>
                  <span className={formIsActive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {formIsActive ? 'Bật' : 'Tắt'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lịch trình hiển thị:</span>
                  <span className="text-slate-400 font-medium">
                    {formStartsAt || formEndsAt ? 'Đang lên lịch' : 'Vô thời hạn'}
                  </span>
                </div>
              </div>

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
            
            <h4 className="text-base font-extrabold text-slate-800">Xác Nhận Xóa Banner</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-semibold">
              Hành động này sẽ xóa vĩnh viễn thông tin cấu hình banner khỏi hệ thống SQLite. Bạn có chắc chắn muốn tiếp tục không?
            </p>
            
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
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
