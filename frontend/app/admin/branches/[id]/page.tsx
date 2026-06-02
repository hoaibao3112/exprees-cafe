'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, ImageIcon, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { adminBranchesApi } from '@/lib/admin-api';
import { toast } from '@/components/admin/Toast';
import { CardSkeleton } from '@/components/admin/Skeleton';

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

export default function AdminEditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();

  // Fetch branch details
  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['admin', 'branches', id],
    queryFn: () => adminBranchesApi.getById(id) as Promise<any>,
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
      const open = branch.openingHours?.open || '07:00';
      const close = branch.openingHours?.close || '22:00';
      reset({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || '',
        openTime: open,
        closeTime: close,
        imageUrl: branch.imageUrl || '',
        lat: branch.lat ?? 10.7624,
        lng: branch.lng ?? 106.7096,
        isFlagship: branch.isFlagship ?? false,
        status: branch.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
    }
  }, [branch, reset]);

  const imageUrlValue = watch('imageUrl');

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
        <p className="text-red-400 font-semibold">Lỗi tải dữ liệu chi nhánh</p>
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
      <div className="flex items-center gap-3 border-b border-white/6 pb-5">
        <Link
          href="/admin/branches"
          className="p-2 rounded-xl bg-white/5 border border-white/6 hover:bg-white/10 hover:text-white text-gray-400 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">Chỉnh sửa chi nhánh</h2>
          <p className="text-gray-500 text-xs mt-0.5">Cập nhật thông tin chi nhánh và tọa độ GPS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#13131f] border border-white/6 rounded-2xl p-6 space-y-4">
            {/* Tên chi nhánh */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Tên chi nhánh</label>
              <input
                {...register('name')}
                placeholder="Nhập tên chi nhánh (ví dụ: NGUYỄN TRÃI, QUẬN 5)..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all font-medium text-sm"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Địa chỉ chi tiết</label>
              <input
                {...register('address')}
                placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Số điện thoại liên hệ</label>
              <input
                {...register('phone')}
                placeholder="Ví dụ: 0909666792..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Giờ mở cửa & Giờ đóng cửa */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Giờ mở cửa</label>
                <input
                  type="time"
                  {...register('openTime')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer text-sm"
                />
                {errors.openTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.openTime.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Giờ đóng cửa</label>
                <input
                  type="time"
                  {...register('closeTime')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer text-sm"
                />
                {errors.closeTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.closeTime.message}</p>
                )}
              </div>
            </div>

            {/* Tọa độ địa lý GPS */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/6 pt-4">
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" /> Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('lat', { valueAsNumber: true })}
                  placeholder="Ví dụ: 10.7624"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 text-sm"
                />
                {errors.lat && (
                  <p className="text-red-500 text-xs mt-1">{errors.lat.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" /> Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('lng', { valueAsNumber: true })}
                  placeholder="Ví dụ: 106.7096"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 text-sm"
                />
                {errors.lng && (
                  <p className="text-red-500 text-xs mt-1">{errors.lng.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-5">
          <div className="bg-[#13131f] border border-white/6 rounded-2xl p-5 space-y-5">
            <h3 className="text-white font-bold text-sm pb-3 border-b border-white/6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Tùy chọn chi nhánh
            </h3>

            {/* Flagship Toggle */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Phân loại chi nhánh</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <span className="text-white text-xs font-semibold block">Cửa hàng Flagship</span>
                  <span className="text-gray-600 text-[10px] block mt-0.5">Cửa hàng quy mô lớn tiêu chuẩn</span>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('isFlagship', !watch('isFlagship'))}
                  className={`w-10 h-6 rounded-full transition-all flex items-center p-0.5 cursor-pointer ${
                    watch('isFlagship') ? 'bg-orange-500 justify-end' : 'bg-white/10 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Trạng thái hoạt động</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'ACTIVE')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'ACTIVE'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'bg-white/3 border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  Đang hoạt động
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'INACTIVE')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'INACTIVE'
                      ? 'bg-red-500/15 border-red-500/50 text-red-400 shadow-md shadow-red-500/5'
                      : 'bg-white/3 border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  Tạm ngưng
                </button>
              </div>
            </div>

            {/* Link ảnh */}
            <div className="space-y-3">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Ảnh chi nhánh</label>
              <input
                {...register('imageUrl')}
                placeholder="Nhập link ảnh (URL)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 text-sm"
              />
              {imageUrlValue ? (
                <div className="relative aspect-video rounded-xl border border-white/6 overflow-hidden bg-white/3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrlValue}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/8 rounded-xl bg-white/2 text-gray-600">
                  <ImageIcon className="w-8 h-8 opacity-30 mb-2" />
                  <span className="text-xs">Chưa có ảnh cửa hàng</span>
                </div>
              )}
              {errors.imageUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
              )}
            </div>

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
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
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
