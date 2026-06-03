'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Award, ArrowLeft, Save } from 'lucide-react';
import { useFranchisePackageByIdQuery, useUpdateFranchisePackageMutation } from '@/hooks/useFranchiseQueries';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { MultiImageUploader } from '@/components/admin/ImageUploader';

interface EditFranchisePackagePageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditFranchisePackagePage({ params }: EditFranchisePackagePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: pkg, isLoading, error } = useFranchisePackageByIdQuery(id);
  const updateMutation = useUpdateFranchisePackageMutation();

  const [name, setName] = useState('');
  const [modelType, setModelType] = useState('KIOSK');
  const [investmentFrom, setInvestmentFrom] = useState<number>(250000000);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>(['']);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate data when package query resolves
  useEffect(() => {
    if (pkg) {
      setName(pkg.name || '');
      setModelType(pkg.modelType || 'KIOSK');
      setInvestmentFrom(Number(pkg.investmentFrom) || 0);
      setDescription(pkg.description || '');
      setIsActive(pkg.isActive !== false);
      setImages(pkg.images && pkg.images.length > 0 ? pkg.images : ['']);
    }
  }, [pkg]);

  const handleAddImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const handleRemoveImageField = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
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
      setSubmitError('Tên gói đầu tư không được để trống.');
      return;
    }

    if (isNaN(investmentFrom) || investmentFrom < 0) {
      setSubmitError('Vốn đầu tư tối thiểu phải là số lớn hơn hoặc bằng 0.');
      return;
    }

    const cleanImages = images.filter((img) => img.trim() !== '');

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name,
          modelType,
          investmentFrom: Number(investmentFrom),
          description,
          images: cleanImages,
          isActive,
        },
      });
      router.push('/admin/franchise');
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi cập nhật gói đầu tư.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <TableSkeleton />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="max-w-4xl mx-auto p-8 border border-dashed border-rose-200 bg-rose-50 text-center rounded-3xl">
        <Award className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="font-extrabold text-base text-rose-800">Không tìm thấy gói đầu tư</h3>
        <p className="text-xs text-rose-500 mt-1">Đường dẫn không hợp lệ hoặc gói đầu tư không tồn tại trong hệ thống.</p>
        <Link href="/admin/franchise" className="inline-flex mt-6 text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="space-y-1.5">
          <Link
            href="/admin/franchise"
            className="inline-flex items-center gap-1 text-slate-450 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Chỉnh Sửa Gói Nhượng Quyền</h2>
        </div>
      </div>

      {/* 2. Main Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form details */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl text-xs font-semibold leading-relaxed">
              {submitError}
            </div>
          )}

          {/* Package Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Tên gói nhượng quyền *
            </label>
            <input
              type="text"
              placeholder="VD: Gói KIOSK - Tối ưu mặt tiền phố..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold placeholder:text-slate-400"
            />
          </div>

          {/* Investment limit & Model Type row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Model Type */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Mô hình nhượng quyền
              </label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-semibold"
              >
                <option value="KIOSK">KIOSK (Take away)</option>
                <option value="EXPRESS">EXPRESS (Cửa hàng chuẩn)</option>
                <option value="PREMIUM">PREMIUM (Cửa hàng cao cấp)</option>
              </select>
            </div>

            {/* Investment From */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Vốn đầu tư ban đầu (VND) *
              </label>
              <input
                type="number"
                placeholder="VD: 250000000"
                value={investmentFrom || ''}
                onChange={(e) => setInvestmentFrom(parseInt(e.target.value) || 0)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-bold"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Mô tả chi tiết gói đầu tư
            </label>
            <textarea
              rows={6}
              placeholder="Nhập giới thiệu chi tiết mô hình, diện tích đề xuất và các ưu đãi nhượng quyền..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Dynamic Image Paths – with upload from computer */}
          <div className="border-t border-slate-100 pt-6">
            <MultiImageUploader
              label="Hình ảnh mô phỏng (Đa ảnh)"
              images={images.filter((img) => img.trim() !== '')}
              onChange={(updated) => setImages(updated.length > 0 ? updated : [''])}
              maxImages={4}
            />
          </div>
        </div>

        {/* Right Column: Configs & Preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status Settings */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">Cấu hình</h3>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Trạng thái hoạt động
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-semibold"
              >
                <option value="true">Hiển thị công khai (Active)</option>
                <option value="false">Tạm ẩn hoạt động (Inactive)</option>
              </select>
            </div>
          </div>



          {/* Action buttons */}
          <div className="flex gap-4">
            <Link
              href="/admin/franchise"
              className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider text-center rounded-2xl transition-all"
            >
              Hủy bỏ
            </Link>
            
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
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
