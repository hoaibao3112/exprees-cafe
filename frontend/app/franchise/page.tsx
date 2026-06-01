'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFranchisePackagesQuery, useApplyFranchiseMutation } from '../../hooks/useFranchiseQueries';
import { Coffee, Award, ShieldCheck, TrendingUp, CheckCircle, RefreshCw, Send, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

const applySchema = z.object({
  packageId: z.string().min(1, 'Vui lòng lựa chọn gói đầu tư'),
  applicantName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại phải từ 10 số trở lên'),
  province: z.string().min(1, 'Vui lòng điền tỉnh/thành phố của bạn'),
  notes: z.string().optional(),
});

type ApplyInput = z.infer<typeof applySchema>;

export default function FranchisePage() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                COOPERATE
              </span>
            </div>
          </div>
          <Link
            href="/branches"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            Hệ Thống Cửa Hàng
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="text-center py-16 px-4 max-w-4xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          Chương trình Nhượng Quyền 2026
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Cùng Express Cafe Khởi Nghiệp Thịnh Vượng
        </h1>
        <p className="text-slate-400 text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          Chúng tôi sở hữu mô hình F&B SaaS hiện đại, tự động hóa vận hành, quản trị chuỗi nhịp nhàng từ xa. Đồng hành cùng 100+ nhà đầu tư trong nước.
        </p>
      </section>

      {/* Trust factors cards */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex items-start gap-4">
          <TrendingUp className="w-10 h-10 text-emerald-400 shrink-0 bg-emerald-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-slate-200">ROI cực kỳ hấp dẫn</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Thời gian hòa vốn trung bình chỉ từ 6 - 12 tháng tùy quy mô gói đầu tư. Tỷ suất lợi nhuận ròng đạt 25% - 30%.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex items-start gap-4">
          <ShieldCheck className="w-10 h-10 text-indigo-400 shrink-0 bg-indigo-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-slate-200">Hỗ trợ vận hành SaaS</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cung cấp trọn gói phần mềm bán hàng POS, quản lý tồn kho, định vị GPS, khuyến mãi, Loyalty và hỗ trợ Marketing chuỗi.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex items-start gap-4">
          <Award className="w-10 h-10 text-amber-400 shrink-0 bg-amber-500/10 p-2 rounded-2xl" />
          <div>
            <h3 className="font-bold text-slate-200">Thương hiệu uy tín</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Nguyên liệu cà phê hữu cơ thượng hạng đạt chuẩn XK. Menu đa dạng cập nhật định kỳ theo xu hướng thị trường.
            </p>
          </div>
        </div>
      </section>

      {/* Main interactive area */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Packages Cards */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-slate-200 mb-2 flex items-center gap-2">
            <Coffee className="text-indigo-400" /> Chọn Gói Đầu Tư Phù Hợp
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-sm">Đang tải các gói đầu tư nhượng quyền...</p>
            </div>
          ) : (
            (packages || []).map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  selectedPkgId === pkg.id
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-800/85 bg-slate-900/30 hover:border-slate-700/80'
                }`}
              >
                {selectedPkgId === pkg.id && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Đã Chọn
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-200">{pkg.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Mẫu: {pkg.modelType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Vốn đầu tư dự kiến</span>
                  <span className="text-base font-extrabold text-amber-500">
                    Từ {Number(pkg.investmentFrom).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Application Form */}
        <div className="lg:col-span-5">
          <div className="p-6 border border-slate-800/85 rounded-3xl bg-slate-900/20 backdrop-blur-md sticky top-24">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <Building className="text-indigo-400" /> Nhận Tư Vấn Chi Tiết
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Điền đơn đăng ký bên dưới. Chuyên viên nhượng quyền Express Cafe sẽ chủ động liên hệ gửi File phân tích tài chính & kế hoạch thiết kế.
            </p>

            {successMessage ? (
              <div className="mt-6 p-5 border border-emerald-900/30 bg-emerald-950/20 rounded-2xl text-emerald-400 text-center flex flex-col items-center">
                <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 animate-pulse" />
                <p className="text-sm font-semibold">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gói đầu tư nhượng quyền</label>
                  <select
                    {...register('packageId')}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 text-sm"
                  >
                    <option value="" className="bg-slate-950">--- Chọn gói đầu tư ---</option>
                    {(packages || []).map((pkg) => (
                      <option key={pkg.id} value={pkg.id} className="bg-slate-950">
                        {pkg.name} ({Number(pkg.investmentFrom).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                  {errors.packageId && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.packageId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Họ và tên đối tác</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    {...register('applicantName')}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-600"
                  />
                  {errors.applicantName && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.applicantName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    placeholder="0909xxxxxx"
                    {...register('phone')}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-600"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Khu vực dự kiến mở quán (Tỉnh/Thành)</label>
                  <input
                    type="text"
                    placeholder="Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                    {...register('province')}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-600"
                  />
                  {errors.province && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ghi chú thêm (Không bắt buộc)</label>
                  <textarea
                    rows={3}
                    placeholder="Mong muốn tư vấn về chính sách hoàn vốn chi tiết..."
                    {...register('notes')}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850/50 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98]"
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
    </div>
  );
}
