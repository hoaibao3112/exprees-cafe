'use client';

import { useState } from 'react';
import { useValidateCouponMutation } from '../../hooks/usePromotionsQueries';
import { Award, Check, Percent, Tag, RefreshCw, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PromotionsPage() {
  const [couponCode, setCouponCode] = useState('');
  const [subtotal, setSubtotal] = useState(250000); // Simulated checkout subtotal
  const [validationResult, setValidationResult] = useState<{
    code: string;
    discountApplied: number;
    message: string;
  } | null>(null);

  const validateMutation = useValidateCouponMutation();

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code) return;

    try {
      const res = await validateMutation.mutateAsync({
        code,
        subtotal,
        userId: undefined, // Simulated guest checkout validation
      });
      setValidationResult({
        code: res.code,
        discountApplied: res.discountApplied,
        message: res.message,
      });
      if (!codeToUse) {
        setCouponCode(res.code);
      }
    } catch (err: any) {
      setValidationResult(null);
    }
  };

  const clearCoupon = () => {
    setValidationResult(null);
    setCouponCode('');
  };

  const activeDiscount = validationResult ? validationResult.discountApplied : 0;
  const finalTotal = subtotal - activeDiscount;

  const mockPublicCoupons = [
    {
      code: 'WELCOME100',
      name: 'Chào Mừng Thành Viên Mới',
      type: 'Giảm 100,000đ',
      desc: 'Áp dụng cho đơn hàng tối thiểu 200,000đ',
      minOrder: 200000,
    },
    {
      code: 'EXPRESS50',
      name: 'Uống Thả Ga Express',
      type: 'Giảm 10%',
      desc: 'Mức giảm tối đa không giới hạn. Áp dụng cho đơn hàng tối thiểu 100,000đ',
      minOrder: 100000,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                PROMOTIONS
              </span>
            </div>
          </div>
          <Link
            href="/franchise"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            Hợp tác Nhượng Quyền
          </Link>
        </div>
      </header>

      {/* Page description */}
      <section className="text-center py-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3.5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Cổng Ưu Đãi Express
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
          Nhận mã giảm giá độc quyền, trải nghiệm ứng dụng tính toán chiết khấu đơn hàng cực kỳ linh hoạt và minh bạch.
        </p>
      </section>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coupon Cards grid */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Award className="text-amber-500" /> Ví Mã Giảm Giá Đang Có
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {mockPublicCoupons.map((item) => (
              <div
                key={item.code}
                className="relative overflow-hidden border border-slate-800 bg-slate-900/30 rounded-3xl p-5 backdrop-blur-sm flex flex-col justify-between"
              >
                {/* Visual tickets cutouts on sides */}
                <div className="absolute left-[-10px] top-[40%] w-5 h-5 rounded-full bg-slate-950 border-r border-slate-800" />
                <div className="absolute right-[-10px] top-[40%] w-5 h-5 rounded-full bg-slate-950 border-l border-slate-800" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Percent className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{item.name}</h3>
                      <p className="text-xs text-amber-500 font-extrabold mt-0.5">{item.type}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-widest">
                    Mã: {item.code}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] mt-4 leading-relaxed border-t border-slate-800/50 pt-3">
                  {item.desc}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Đơn tối thiểu: {item.minOrder.toLocaleString('vi-VN')}đ</span>
                  <button
                    onClick={() => handleApplyCoupon(item.code)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Áp Dụng Thử</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulator Checkout Widget */}
        <div className="lg:col-span-6">
          <div className="p-6 border border-slate-800 rounded-3xl bg-slate-900/20 backdrop-blur-md sticky top-24">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <ShoppingBag className="text-indigo-400 animate-pulse" /> Giả Lập Giỏ Hàng & Tính Toán Chiết Khấu
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed border-b border-slate-800/80 pb-4">
              Kéo thanh trượt thay đổi giá trị giỏ hàng bên dưới và áp dụng mã giảm giá để kiểm chứng tỷ suất giảm giá tự động!
            </p>

            {/* Slider to adjust pricing */}
            <div className="mt-6">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                <span>Giá trị giỏ hàng mẫu</span>
                <span className="text-sm font-extrabold text-indigo-400">
                  {subtotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="10000"
                value={subtotal}
                onChange={(e) => {
                  setSubtotal(Number(e.target.value));
                  // Auto re-validate if coupon is already active to show live feedback
                  if (validationResult) {
                    validateMutation.mutate({
                      code: validationResult.code,
                      subtotal: Number(e.target.value),
                    });
                  }
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Promo coupon form input */}
            <div className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!validationResult}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase text-slate-200 placeholder-slate-600 disabled:opacity-50"
                />
              </div>
              {validationResult ? (
                <button
                  onClick={clearCoupon}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
                >
                  Xóa
                </button>
              ) : (
                <button
                  onClick={() => handleApplyCoupon()}
                  disabled={validateMutation.isPending || !couponCode}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-xl text-xs transition-all"
                >
                  {validateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Áp Dụng'
                  )}
                </button>
              )}
            </div>

            {/* Live calculated Invoice receipt */}
            <div className="mt-6 p-5 border border-slate-800/50 rounded-2xl bg-slate-900/30 text-xs text-slate-400 space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span>Tạm tính giỏ hàng</span>
                <span className="font-semibold text-slate-200">{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Mã giảm giá áp dụng</span>
                <span>-{activeDiscount.toLocaleString('vi-VN')} đ</span>
              </div>

              {validationResult && (
                <div className="p-2 border border-emerald-950/20 bg-emerald-500/10 rounded-xl text-emerald-400 text-[10px] leading-relaxed flex items-start gap-1.5 animate-pulse">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{validationResult.message}</span>
                </div>
              )}

              {validateMutation.error && (
                <div className="p-2 border border-red-950/20 bg-red-500/10 rounded-xl text-red-400 text-[10px] leading-relaxed">
                  Lỗi: {validateMutation.error.message}
                </div>
              )}

              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-sm font-bold text-slate-200">
                <span>Tổng cộng đơn hàng</span>
                <span className="text-indigo-400 text-base font-extrabold">{finalTotal.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Promo verification banner */}
            <div className="mt-6 flex items-start gap-3 text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-4">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <span>
                Express Promo Engine tự động bảo mật toàn vẹn số tiền giảm giá thông qua giải thuật TypeORM Transaction, kiểm tra chéo chính sách số lượng mã và thời hạn sử dụng trực tiếp thời gian thực.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
