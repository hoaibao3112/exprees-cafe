'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFranchisePackagesQuery, useApplyFranchiseMutation } from '../../hooks/useFranchiseQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Coffee, Award, ShieldCheck, TrendingUp, CheckCircle, RefreshCw, Send, ArrowLeft, Building, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

const applySchema = z.object({
  packageId: z.string().min(1, 'Vui lòng lựa chọn gói đầu tư'),
  applicantName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại phải từ 10 số trở lên'),
  province: z.string().min(1, 'Vui lòng điền tỉnh/thành phố của bạn'),
  notes: z.string().optional(),
});

type ApplyInput = z.infer<typeof applySchema>;

export default function FranchisePage() {
  // Activate scroll animations
  useScrollAnimation();

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
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

  const onSubmit = async (data: ApplyInput) => {
    setSuccessMessage(null);
    setSubmitError(null);
    try {
      await applyMutation.mutateAsync(data);
      setSuccessMessage('Chúc mừng! Đơn đăng ký hợp tác nhượng quyền của bạn đã được gửi thành công. Ban quản trị sẽ liên hệ sớm nhất!');
      reset();
      setSelectedPkgId(null);
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleSelectPackage = (id: string) => {
    setSelectedPkgId(id);
    setValue('packageId', id);
  };

  return (
    <div className="min-h-screen bg-[#0a0705] text-zinc-100 font-sans pb-16 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-20 left-1/4 w-[40vw] h-[40vw] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header bar */}
      <Header />

      {/* Hero section */}
      <section className="text-center py-20 px-4 max-w-4xl mx-auto relative z-10" data-animate="fade-up">
        <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-orange-400 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
          Chương trình Nhượng Quyền 2026
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-8 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase leading-tight">
          Khởi Nghiệp Thịnh Vượng cùng Express Cafe
        </h1>
        <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-light">
          Chúng tôi sở hữu mô hình F&B SaaS hiện đại, tự động hóa vận hành, quản trị chuỗi nhịp nhàng từ xa. Đồng hành cùng hơn 100+ nhà đầu tư thông thái trên toàn quốc.
        </p>
      </section>

      {/* Trust factors cards */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 relative z-10" data-animate="fade-up" data-delay="150">
        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md flex items-start gap-4 hover:border-zinc-700/80 transition-all duration-350">
          <TrendingUp className="w-10 h-10 text-emerald-400 shrink-0 bg-emerald-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-zinc-150 text-sm">ROI cực kỳ hấp dẫn</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Thời gian hòa vốn trung bình chỉ từ 6 - 12 tháng tùy quy mô gói đầu tư. Tỷ suất lợi nhuận ròng đạt 25% - 30%.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md flex items-start gap-4 hover:border-zinc-700/80 transition-all duration-350">
          <ShieldCheck className="w-10 h-10 text-orange-400 shrink-0 bg-orange-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-zinc-150 text-sm">Hỗ trợ vận hành SaaS</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Cung cấp trọn gói phần mềm bán hàng POS, quản lý tồn kho, định vị GPS, khuyến mãi, Loyalty và hỗ trợ Marketing chuỗi.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md flex items-start gap-4 hover:border-zinc-700/80 transition-all duration-350">
          <Award className="w-10 h-10 text-amber-400 shrink-0 bg-amber-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-zinc-150 text-sm">Thương hiệu uy tín</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Nguyên liệu cà phê hữu cơ thượng hạng đạt chuẩn XK. Menu đa dạng cập nhật định kỳ theo xu hướng thị trường.
            </p>
          </div>
        </div>
      </section>

      {/* Main interactive area */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Packages Cards */}
        <div className="lg:col-span-7 space-y-6" data-animate="fade-right" data-delay="300">
          <h2 className="text-lg font-black uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-2">
            <Coffee className="text-orange-400" /> Chọn Gói Đầu Tư Phù Hợp
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
              <p className="text-xs">Đang tải các gói đầu tư nhượng quyền...</p>
            </div>
          ) : (
            (packages || []).map((pkg, idx) => (
              <Link
                key={pkg.id}
                href={`/franchise/${pkg.id}`}
                className={`p-6 rounded-[28px] border transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] ${
                  selectedPkgId === pkg.id
                    ? 'border-orange-500 bg-orange-950/20 shadow-xl shadow-orange-500/10'
                    : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-700'
                }`}
              >
                {selectedPkgId === pkg.id && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-extrabold uppercase px-3 py-1.5 rounded-bl-2xl tracking-wider">
                    Đã Chọn ✓
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-base transition-colors ${selectedPkgId === pkg.id ? 'text-orange-400' : 'text-zinc-200'}`}>{pkg.name}</h3>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-lg bg-zinc-800/80 text-zinc-400 uppercase tracking-wider">
                      Mẫu: {pkg.modelType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed font-light">{pkg.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vốn đầu tư dự kiến:</span>
                  <span className="text-base font-black text-orange-400">
                    Từ {Number(pkg.investmentFrom).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Application Form */}
        <div className="lg:col-span-5" data-animate="fade-left" data-delay="300">
          <div className="p-6 border border-zinc-800/80 rounded-[28px] bg-zinc-900/20 backdrop-blur-md sticky top-24 shadow-xl">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Building className="text-orange-400" /> Đăng Ký Nhận Tư Vấn
            </h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-light">
              Điền đơn đăng ký bên dưới. Chuyên viên nhượng quyền Express Cafe sẽ chủ động liên hệ gửi File phân tích tài chính & bản vẽ thiết kế 3D.
            </p>

            {successMessage ? (
              <div className="mt-6 p-5 border border-emerald-900/30 bg-emerald-950/20 rounded-2xl text-emerald-400 text-center flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 animate-pulse" />
                <p className="text-xs font-semibold leading-relaxed">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="mt-4 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Gửi đơn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                {submitError && (
                  <div className="p-3 border border-red-900/30 bg-red-950/20 text-red-400 rounded-xl text-xs">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Gói đầu tư nhượng quyền *</label>
                  <select
                    {...register('packageId')}
                    className="w-full px-4 py-2.5 bg-[#120e0c]/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-200 text-xs transition-all"
                  >
                    <option value="" className="bg-[#0a0705]">--- Chọn gói đầu tư ---</option>
                    {(packages || []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id} className="bg-[#0a0705]">
                        {pkg.name} ({Number(pkg.investmentFrom).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                  {errors.packageId && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.packageId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Họ và tên đối tác *</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    {...register('applicantName')}
                    className="w-full px-4 py-2.5 bg-[#120e0c]/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-200 text-xs placeholder-zinc-700 transition-all font-medium"
                  />
                  {errors.applicantName && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.applicantName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    placeholder="VD: 0909xxxxxx"
                    {...register('phone')}
                    className="w-full px-4 py-2.5 bg-[#120e0c]/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-200 text-xs placeholder-zinc-700 transition-all font-medium"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Khu vực dự kiến mở quán *</label>
                  <input
                    type="text"
                    placeholder="VD: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                    {...register('province')}
                    className="w-full px-4 py-2.5 bg-[#120e0c]/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-200 text-xs placeholder-zinc-700 transition-all font-medium"
                  />
                  {errors.province && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Ghi chú yêu cầu thêm</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Cần tìm hiểu về chính sách thuê máy hoặc mặt bằng..."
                    {...register('notes')}
                    className="w-full px-4 py-2.5 bg-[#120e0c]/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-zinc-200 text-xs placeholder-zinc-700 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Đăng ký Hợp Tác Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
