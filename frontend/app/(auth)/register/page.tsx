'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Coffee, Mail, Lock, User, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuthQueries } from '../../../hooks/useAuthQueries';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống'),
  email: z.string().email('Địa chỉ email không hợp lệ').min(1, 'Email không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải dài tối thiểu 6 ký tự'),
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { registerMutation } = useAuthQueries();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setErrorMessage(null);
    try {
      const response = await registerMutation.mutateAsync(data);
      // On success, redirect to verify-otp page with the created userId
      router.push(`/verify-otp?userId=${response.userId}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công, vui lòng thử lại.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[100px] animate-pulse-slow"></div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4">
            <Coffee className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Đăng ký thành viên</h2>
          <p className="text-zinc-400 text-sm mt-1.5 font-medium">Nhận ngay 100 điểm thưởng chào mừng cực chất! 🎉</p>
        </div>

        {/* Form Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider uppercase pl-1">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                {...register('name')}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-zinc-500"
              />
            </div>
            {errors.name && (
              <span className="text-xs font-semibold text-rose-400 pl-1">{errors.name.message}</span>
            )}
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider uppercase pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="customer@example.com"
                {...register('email')}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-zinc-500"
              />
            </div>
            {errors.email && (
              <span className="text-xs font-semibold text-rose-400 pl-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider uppercase pl-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-zinc-500"
              />
            </div>
            {errors.password && (
              <span className="text-xs font-semibold text-rose-400 pl-1">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
          >
            {registerMutation.isPending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-1">
                Tiếp tục đăng ký <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-zinc-400 mt-8 pt-6 border-t border-white/5">
          Đã có tài khoản thành viên?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline font-bold">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
