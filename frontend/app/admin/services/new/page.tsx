'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, RefreshCw, Coffee,
  CheckCircle2, EyeOff, Lightbulb
} from 'lucide-react';
import { useCreateServiceMutation } from '@/hooks/useServicesQueries';
import { MultiImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const MAX_NAME = 100;

export default function AdminNewServicePage() {
  const router = useRouter();
  const createMutation = useCreateServiceMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [images, setImages] = useState<string[]>(['']);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Tên dịch vụ không được để trống.');
      return;
    }

    const cleanImages = images.filter((img) => img.trim() !== '');

    try {
      await createMutation.mutateAsync({
        name,
        description,
        status,
        images: cleanImages,
        imageUrl: cleanImages.length > 0 ? cleanImages[0] : undefined,
      });
      router.push('/admin/services');
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi tạo dịch vụ.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Thêm Dịch Vụ Mới</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Bản nháp mới
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Error Banner */}
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {submitError}
            </div>
          )}

          {/* Card 1: Basic Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
              <Coffee className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Thông tin cơ bản</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-600">
                    Tên dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-semibold tabular-nums ${name.length > MAX_NAME * 0.9 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {name.length}/{MAX_NAME}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="VD: Cho thuê máy pha cà phê văn phòng..."
                  value={name}
                  maxLength={MAX_NAME}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Mô tả chi tiết dịch vụ</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Mô tả ngắn gọn về dịch vụ, điểm nổi bật, đối tượng phù hợp và quyền lợi khách hàng nhận được..."
                  minHeight="200px"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Dùng thanh công cụ bên trên để định dạng văn bản: in đậm, màu chữ, danh sách...
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Images */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base">🖼️</span>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Hình ảnh dịch vụ</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Tối đa 4 ảnh</span>
            </div>
            <div className="p-6">
              <MultiImageUploader
                label=""
                images={images.filter((img) => img.trim() !== '')}
                onChange={(updated) => setImages(updated.length > 0 ? updated : [''])}
                maxImages={4}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Sidebar ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* Publish Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Xuất bản</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Status Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">Trạng thái hiển thị</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('ACTIVE')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      status === 'ACTIVE'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('INACTIVE')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      status === 'INACTIVE'
                        ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Tạm ẩn
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
              >
                {createMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo dịch vụ'}
              </button>

              {/* Cancel */}
              <Link
                href="/admin/services"
                className="block text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Hủy bỏ
              </Link>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-widest">Gợi ý</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Tên dịch vụ nên ngắn gọn, dưới 60 ký tự.',
                'Mô tả rõ lợi ích khách hàng nhận được.',
                'Ảnh đầu tiên sẽ là ảnh đại diện chính.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 text-xs font-black mt-0.5 shrink-0">·</span>
                  <span className="text-[11px] text-amber-700/80 font-medium leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </form>
    </div>
  );
}
