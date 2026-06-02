'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFranchisePackagesQuery, useApplyFranchiseMutation } from '../../../hooks/useFranchiseQueries';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { Coffee, Award, ShieldCheck, TrendingUp, CheckCircle, RefreshCw, Send, ArrowLeft, Building, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';

const applySchema = z.object({
  packageId: z.string().min(1, 'Vui lòng lựa chọn gói đầu tư'),
  applicantName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại phải từ 10 số trở lên'),
  province: z.string().min(1, 'Vui lòng điền tỉnh/thành phố của bạn'),
  notes: z.string().optional(),
});

type ApplyInput = z.infer<typeof applySchema>;

export default function FranchiseRegisterPage() {
  // Activate scroll animations
  useScrollAnimation();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: packages, isLoading } = useFranchisePackagesQuery();
  const applyMutation = useApplyFranchiseMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyInput>({
    resolver: zodResolver(applySchema),
  });

  // Extract packageId safely on mount without Suspense boundary warnings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pkgId = params.get('packageId');
      if (pkgId) {
        setValue('packageId', pkgId);
      }
    }
  }, [packages, setValue]);

  const onSubmit = async (data: ApplyInput) => {
    setSuccessMessage(null);
    setSubmitError(null);
    try {
      await applyMutation.mutateAsync(data);
      setSuccessMessage('Chúc mừng! Đơn đăng ký hợp tác nhượng quyền của bạn đã được gửi thành công. Ban quản trị Express Cafe sẽ liên hệ với bạn trong vòng 24 giờ tới!');
      reset();
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Navigation Header */}
      <Header />

      {/* 2. Dark Breadcrumbs Header */}
      <section 
        className="relative w-full h-[180px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.75)), url('/media__1780386795847.png')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-light text-white uppercase tracking-[0.2em] leading-none" data-animate="blur-in">
            ĐĂNG KÝ HỢP TÁC
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-350 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <span className="text-zinc-500">|</span>
            <Link href="/franchise" className="hover:text-orange-500 transition-colors">Nhượng quyền</Link>
            <span className="text-zinc-500">|</span>
            <span className="text-orange-500 font-bold uppercase">ĐĂNG KÝ NHƯỢNG QUYỀN</span>
          </div>
        </div>
      </section>

      {/* 3. Main Form Section */}
      <main className="max-w-xl mx-auto px-4 w-full py-16 flex-1">
        <div 
          className="bg-white border border-zinc-200 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-zinc-200/50 relative overflow-hidden"
          data-animate="scale-up"
        >
          {/* Top subtle decorative ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-[#e9762b]" />

          <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#e9762b] shrink-0 shadow-sm">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900">ĐĂNG KÝ HỢP TÁC NHƯỢNG QUYỀN</h2>
              <p className="text-xs text-zinc-400 mt-1 font-semibold">Nhận bản thiết kế 3D & file phân tích tài chính miễn phí</p>
            </div>
          </div>

          {successMessage ? (
            <div className="py-6 flex flex-col items-center text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-md shadow-emerald-500/5">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-zinc-800 uppercase tracking-wide">ĐĂNG KÝ THÀNH CÔNG</h3>
              <p className="text-sm text-zinc-500 mt-3 leading-relaxed max-w-sm font-light">
                {successMessage}
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full">
                <Link
                  href="/"
                  className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold uppercase tracking-widest text-center rounded-2xl transition-all shadow-md active:scale-[0.98]"
                >
                  Về trang chủ
                </Link>
                <Link
                  href="/franchise"
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold uppercase tracking-widest text-center rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]"
                >
                  Xem các mô hình
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {submitError && (
                <div className="p-4 border border-red-100 bg-red-50 text-red-500 rounded-2xl text-xs font-semibold leading-relaxed">
                  {submitError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Gói đầu tư nhượng quyền *</label>
                <select
                  {...register('packageId')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-800 text-xs transition-all font-semibold"
                >
                  <option value="">--- Chọn gói đầu tư ---</option>
                  {(packages || []).map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({Number(pkg.investmentFrom).toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
                </select>
                {errors.packageId && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.packageId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Họ và tên đối tác *</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  {...register('applicantName')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-800 text-xs transition-all font-bold"
                />
                {errors.applicantName && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.applicantName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  placeholder="VD: 0909xxxxxx"
                  {...register('phone')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-800 text-xs transition-all font-bold"
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Khu vực mở quán *</label>
                <input
                  type="text"
                  placeholder="VD: Hồ Chí Minh, Hà Nội..."
                  {...register('province')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-800 text-xs transition-all font-bold"
                />
                {errors.province && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.province.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Ghi chú thêm</label>
                <textarea
                  rows={3}
                  placeholder="VD: Cần tư vấn chi tiết..."
                  {...register('notes')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-800 text-xs transition-all font-medium leading-relaxed"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3.5">
                <Link
                  href="/franchise"
                  className="flex items-center justify-center gap-1.5 py-3.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all cursor-pointer select-none active:scale-[0.98] sm:w-[150px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#e9762b] hover:bg-orange-600 disabled:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>GỬI ĐĂNG KÝ HỢP TÁC</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

    </div>
  );
}
