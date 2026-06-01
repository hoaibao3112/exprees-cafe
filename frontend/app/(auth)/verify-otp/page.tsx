'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { Coffee, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthQueries } from '../../../hooks/useAuthQueries';
import { useState, Suspense } from 'react';

const otpSchema = z.object({
  code: z.string().length(6, 'Mã xác thực OTP phải gồm đúng 6 chữ số'),
});

type OtpInput = z.infer<typeof otpSchema>;

function OtpVerificationContent() {
  const { verifyOtpMutation } = useAuthQueries();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId') || '';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: OtpInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!userId) {
      setErrorMessage('Không tìm thấy thông tin tài khoản cần xác thực. Vui lòng đăng ký lại.');
      return;
    }

    try {
      const response = await verifyOtpMutation.mutateAsync({
        userId,
        code: data.code,
      });
      setSuccessMessage(response.message || 'Kích hoạt tài khoản thành công!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl">
      
      {/* Logo Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Xác thực tài khoản</h2>
        <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
          Mã xác thực OTP đã được gửi đến Console của backend. Vui lòng kiểm tra và nhập mã 6 số bên dưới.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-6 animate-pulse">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="leading-relaxed">
            <p className="font-bold">{successMessage}</p>
            <p className="text-zinc-400 text-xs mt-0.5">Đang tự động chuyển hướng đến màn hình Đăng nhập...</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* OTP Input block */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-semibold text-zinc-300 tracking-wider uppercase">Nhập mã OTP</label>
          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            {...register('code')}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-center text-white text-2xl font-extrabold tracking-[0.4em] pl-[0.4em] focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-zinc-700"
          />
          {errors.code && (
            <span className="text-xs font-semibold text-rose-400 block mt-1">{errors.code.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={verifyOtpMutation.isPending || !!successMessage}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
        >
          {verifyOtpMutation.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            'Kích hoạt ngay'
          )}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[100px] animate-pulse-slow"></div>

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }>
        <OtpVerificationContent />
      </Suspense>
    </div>
  );
}
