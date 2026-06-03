'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { adminBranchesApi } from '@/lib/admin-api';
import { toast } from '@/components/admin/Toast';
import { CardSkeleton } from '@/components/admin/Skeleton';
import { ImageUploader } from '@/components/admin/ImageUploader';

const branchSchema = z.object({
  name: z.string().min(1, 'Tên chi nhánh không được để trống').max(100, 'Tên chi nhánh tối đa 100 ký tự'),
  address: z.string().min(1, 'Địa chỉ không được để trống').max(200, 'Địa chỉ tối đa 200 ký tự'),
  phone: z.string().min(10, 'Số điện thoại tối thiểu 10 số').max(15, 'Số điện thoại tối đa 15 số').or(z.literal('')),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ mở cửa không hợp lệ (HH:MM)'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ đóng cửa không hợp lệ (HH:MM)'),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional(),
  lat: z.number({ message: 'Vĩ độ phải là số' }).min(-90, 'Vĩ độ tối thiểu là -90').max(90, 'Vĩ độ tối đa là 90'),
  lng: z.number({ message: 'Kinh độ phải là số' }).min(-180, 'Kinh độ tối thiểu là -180').max(180, 'Kinh độ tối đa là 180'),
  isFlagship: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE'] as const),
});

type BranchFormValues = z.infer<typeof branchSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs font-semibold mt-0.5">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium';

export default function AdminEditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  // Fetch branch details
  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['admin', 'branches', id],
    queryFn: () => adminBranchesApi.getById(id) as Promise<Record<string, unknown>>,
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      openTime: '07:00',
      closeTime: '22:00',
      imageUrl: '',
      lat: 10.7624,
      lng: 106.7096,
      isFlagship: false,
      status: 'ACTIVE',
    },
  });

  // Prefill form values after fetch succeeds
  useEffect(() => {
    if (branch) {
      const openingHours = branch.openingHours as { open?: string; close?: string } | undefined;
      const open = openingHours?.open || '07:00';
      const close = openingHours?.close || '22:00';
      reset({
        name: (branch.name as string) || '',
        address: (branch.address as string) || '',
        phone: (branch.phone as string) || '',
        openTime: open,
        closeTime: close,
        imageUrl: (branch.imageUrl as string) || '',
        lat: (branch.lat as number) ?? 10.7624,
        lng: (branch.lng as number) ?? 106.7096,
        isFlagship: (branch.isFlagship as boolean) ?? false,
        status: branch.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
    }
  }, [branch, reset]);

  const imageUrlValue = watch('imageUrl') ?? '';

  const updateMutation = useMutation({
    mutationFn: (values: BranchFormValues) => {
      const payload = {
        name: values.name,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        phone: values.phone || undefined,
        openingHours: {
          open: values.openTime,
          close: values.closeTime,
        },
        isFlagship: values.isFlagship,
        status: values.status,
        imageUrl: values.imageUrl || undefined,
      };
      return adminBranchesApi.update(id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'branches'] });
      qc.invalidateQueries({ queryKey: ['admin', 'branches', id] });
      toast.success('Đã cập nhật chi nhánh thành công!');
      router.push('/admin/branches');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật chi nhánh');
    },
  });

  const onSubmit = (values: BranchFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-rose-500 font-semibold">Lỗi tải dữ liệu chi nhánh</p>
        <Link
          href="/admin/branches"
          className="inline-block px-5 py-2.5 bg-orange-500 rounded-xl text-white font-medium hover:bg-orange-400 transition-colors"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Link
          href="/admin/branches"
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa chi nhánh</h2>
          <p className="text-slate-400 text-xs mt-0.5">Cập nhật thông tin chi nhánh và tọa độ GPS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <Field label="Tên chi nhánh" error={errors.name?.message}>
              <input
                {...register('name')}
                placeholder="Nhập tên chi nhánh (ví dụ: NGUYỄN TRÃI, QUẬN 5)..."
                className={inputCls}
              />
            </Field>

            <Field label="Địa chỉ chi tiết" error={errors.address?.message}>
              <input
                {...register('address')}
                placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                className={inputCls}
              />
            </Field>

            <Field label="Số điện thoại liên hệ" error={errors.phone?.message}>
              <input
                {...register('phone')}
                placeholder="Ví dụ: 0909666792..."
                className={inputCls}
              />
            </Field>

            {/* Opening Hours */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Giờ mở cửa" error={errors.openTime?.message}>
                <input
                  type="time"
                  {...register('openTime')}
                  className={inputCls}
                />
              </Field>
              <Field label="Giờ đóng cửa" error={errors.closeTime?.message}>
                <input
                  type="time"
                  {...register('closeTime')}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* GPS Coordinates */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <Field label="Vĩ độ (Latitude)" error={errors.lat?.message}>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                  <input
                    type="number"
                    step="any"
                    {...register('lat', { valueAsNumber: true })}
                    placeholder="Ví dụ: 10.7624"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Kinh độ (Longitude)" error={errors.lng?.message}>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                  <input
                    type="number"
                    step="any"
                    {...register('lng', { valueAsNumber: true })}
                    placeholder="Ví dụ: 106.7096"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Tùy chọn chi nhánh
            </h3>

            {/* Flagship Toggle */}
            <Field label="Phân loại chi nhánh">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-700 text-xs font-semibold block">Cửa hàng Flagship</span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Cửa hàng quy mô lớn tiêu chuẩn</span>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('isFlagship', !watch('isFlagship'))}
                  className={`w-10 h-6 rounded-full transition-all flex items-center p-0.5 cursor-pointer ${
                    watch('isFlagship') ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </Field>

            {/* Status */}
            <Field label="Trạng thái hoạt động">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'ACTIVE')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'ACTIVE'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Đang hoạt động
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'INACTIVE')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'INACTIVE'
                      ? 'bg-red-50 border-red-400 text-red-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tạm ngưng
                </button>
              </div>
            </Field>

            {/* Image Upload */}
            <ImageUploader
              label="Ảnh chi nhánh"
              value={imageUrlValue}
              onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
              aspect="aspect-video"
            />
            {errors.imageUrl && (
              <p className="text-rose-500 text-xs font-semibold -mt-3">{errors.imageUrl.message}</p>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu chi nhánh
              </button>
              <Link
                href="/admin/branches"
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-sm font-semibold transition-all"
              >
                Hủy bỏ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
