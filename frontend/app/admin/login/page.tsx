'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Coffee, Lock, Mail, AlertCircle } from 'lucide-react';
import { adminAuthApi } from '@/lib/admin-api';

const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type LoginInput = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const sessionExpired = searchParams.get('error') === 'session_expired';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (sessionExpired) {
      setServerError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, [sessionExpired]);

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    try {
      const res = await adminAuthApi.login(data.email, data.password);
      const token = res.accessToken;
      document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email hoặc mật khẩu không đúng';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#f1f5f9] flex items-center justify-center md:grid md:grid-cols-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Left Column: Login Card (Spans 7 cols on large screens, centered) */}
      <div className="col-span-7 flex items-center justify-center p-6 z-10 w-full">
        <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Logo & Brand Header */}
          <div className="p-8 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0047cc] shadow-md shadow-blue-500/20 mb-4">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Express Cafe Admin</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">CỔNG AN NINH DOANH NGHIỆP</p>
          </div>

          <div className="p-8">
            {/* Server Error Alert */}
            {serverError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Address Input */}
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@expresscafe.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                      errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200/80 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-700 text-sm font-semibold">Mật khẩu</label>
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                      errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200/80 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keep-signed-in"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="keep-signed-in" className="ml-2 text-slate-500 text-sm font-medium select-none cursor-pointer">
                  Duy trì đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#0047cc] hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <span className="text-base">➔</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer of Card */}
          <div className="bg-slate-50/80 border-t border-slate-100 p-6 text-center space-y-2">
            <p className="text-slate-400 text-xs font-semibold tracking-wider">CHỈ DÀNH CHO NHÂN VIÊN ĐƯỢC ỦY QUYỀN</p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
              <a href="#" className="hover:text-blue-600 transition-colors">Chính Sách Bảo Mật</a>
              <span className="text-slate-300">•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Trạng Thái Hệ Thống</a>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: Coffee Cup premium graphic (Spans 5 cols on large screens, hidden on mobile) */}
      <div className="hidden md:block col-span-5 h-full relative overflow-hidden bg-[#c3cddb]">
        {/* Swirling steam vector backgrounds or minimal mock-up layout */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#c9d3e0] to-[#b8c3d1] p-12">
          
          {/* Main Visual container simulating the beautiful cup screen */}
          <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl bg-slate-300/40 shadow-inner overflow-hidden flex flex-col justify-end p-8 border border-white/10 group">
            
            {/* Swirling smoke mock using CSS */}
            <div className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-20 filter blur-xs"
              style={{ backgroundImage: 'radial-gradient(circle, white 10%, transparent 60%)' }} />
            
            {/* Absolute coffee cup mockup overlay using custom CSS & standard visuals */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
              <div className="relative w-64 h-64 flex flex-col items-center justify-center animate-pulse-slow">
                {/* Simulated cup */}
                <div className="w-40 h-28 bg-white/95 rounded-b-[40px] rounded-t-lg shadow-xl relative border border-white/20">
                  {/* Handle */}
                  <div className="absolute right-[-24px] top-4 w-8 h-16 border-4 border-white/95 rounded-r-3xl border-l-0 shadow-md" />
                  {/* Plate */}
                  <div className="absolute bottom-[-10px] left-[-30px] w-[220px] h-4 bg-white/95 rounded-full border border-white/20 shadow-md" />
                </div>
                {/* Rising steam */}
                <div className="absolute top-2 w-28 h-20 opacity-30 flex justify-around">
                  <div className="w-1.5 h-16 bg-gradient-to-t from-white to-transparent rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-20 bg-gradient-to-t from-white to-transparent rounded-full animate-bounce delay-300" />
                  <div className="w-1.5 h-14 bg-gradient-to-t from-white to-transparent rounded-full animate-bounce" />
                </div>
              </div>
            </div>

            <div className="z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-white shadow-lg">
              <h3 className="text-xl font-bold tracking-tight">Express Cafe</h3>
              <p className="text-white/80 text-xs mt-2 leading-relaxed">
                Hương vị cà phê truyền thống đậm đà hòa quyện cùng công nghệ quản trị hiện đại, mang đến sự hoàn hảo trong từng điểm chạm dịch vụ.
              </p>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
