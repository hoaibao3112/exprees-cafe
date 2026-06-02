'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useCreateServiceMutation } from '@/hooks/useServicesQueries';
import { resolveUploadUrl } from '@/lib/api';

export default function AdminNewServicePage() {
  const router = useRouter();
  const createMutation = useCreateServiceMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  
  // Dynamic images list supporting multiple image uploads/inputs
  const [images, setImages] = useState<string[]>(['']);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const handleRemoveImageField = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // Maintain at least one field
    setImages(updated.length > 0 ? updated : ['']);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Tên dịch vụ không được để trống.');
      return;
    }

    // Clean up empty image strings
    const cleanImages = images.filter((img) => img.trim() !== '');

    try {
      await createMutation.mutateAsync({
        name,
        description,
        status,
        images: cleanImages,
        imageUrl: cleanImages.length > 0 ? cleanImages[0] : undefined
      });
      router.push('/admin/services');
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi tạo dịch vụ.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header with Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="space-y-1.5">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1 text-slate-450 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Thêm Dịch Vụ F&B Mới</h2>
        </div>
      </div>

      {/* 2. Main Form Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Main form fields */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-xs font-semibold leading-relaxed">
              {submitError}
            </div>
          )}

          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              placeholder="VD: Rang xay cà phê nguyên chất sỉ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Mô tả chi tiết dịch vụ
            </label>
            <textarea
              rows={6}
              placeholder="Nhập nội dung giới thiệu, mô tả, và quyền lợi dịch vụ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Dynamic Multiple Images list */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Hình ảnh dịch vụ (Đa ảnh)</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Thêm tối đa 4 đường dẫn ảnh (ví dụ: uploads/services/file.png)</p>
              </div>
              
              <button
                type="button"
                onClick={handleAddImageField}
                disabled={images.length >= 4}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-sm select-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm ảnh
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="font-bold text-slate-400 text-xs w-6 text-center">#{idx + 1}</div>
                  <input
                    type="text"
                    placeholder="Nhập đường dẫn ảnh hoặc link URL..."
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageField(idx)}
                    className="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Live Preview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status Settings Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">Cấu hình</h3>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Trạng thái hiển thị
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-semibold"
              >
                <option value="ACTIVE">Hoạt động (Active)</option>
                <option value="INACTIVE">Tạm ẩn (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Live Image Preview Block */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">Hình ảnh hiển thị đầu</h3>
            
            {images[0]?.trim() ? (
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm">
                <img
                  src={resolveUploadUrl(images[0])}
                  alt="Primary Image Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visually if path is broken
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=300&auto=format&fit=crop';
                  }}
                />
              </div>
            ) : (
              <div className="aspect-[4/3] w-full rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-350 py-10">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
              </div>
            )}
          </div>

          {/* Save Controls */}
          <div className="flex gap-4">
            <Link
              href="/admin/services"
              className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider text-center rounded-2xl transition-all"
            >
              Hủy bỏ
            </Link>
            
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer cursor-pointer shadow-md shadow-blue-500/10"
            >
              <Save className="w-4 h-4" />
              LƯU LẠI
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
