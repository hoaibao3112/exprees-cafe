'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { adminAuthApi } from '@/lib/admin-api';

const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
type LoginInput = z.infer<typeof loginSchema>;

const BRAND_SHOWCASE = [
  { src: '/slideshow_1.jpg', label: 'Cho thuê máy pha cà phê' },
  { src: '/slideshow_2.jpg', label: 'Nhượng quyền thương hiệu' },
  { src: '/slideshow_3.jpg', label: 'Cà phê nguyên chất' },
  { src: '/slideshow_4.jpg', label: 'Vận hành SaaS thông minh' },
] as const;

function AdminLoginForm() {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex md:grid md:grid-cols-12 relative overflow-hidden">
      {/* Background decorations — left side */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 md:w-7/12">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-500/8 blur-3xl" />
        <div className="absolute -bottom-40 left-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Left: Login form */}
      <div className="md:col-span-7 flex items-center justify-center p-6 z-10 w-full min-h-screen">
        <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
          <div className="p-8 text-center border-b border-slate-100">
            <div className="relative w-[200px] h-[56px] mx-auto mb-4">
              <Image
                src="/logo.png?v=2"
                alt="Express Cafe"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1.5">
              Cổng an ninh doanh nghiệp
            </p>
          </div>

          <div className="p-8">
            {serverError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="admin@expresscafe.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 ${
                      errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200/80 focus:border-orange-500'
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-700 text-sm font-semibold">Mật khẩu</label>
                  <a href="#" className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-semibold">
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
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 text-sm transition-all outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 ${
                      errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200/80 focus:border-orange-500'
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keep-signed-in"
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/20"
                />
                <label htmlFor="keep-signed-in" className="ml-2 text-slate-500 text-sm font-medium select-none cursor-pointer">
                  Duy trì đăng nhập
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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

          <div className="bg-slate-50/80 border-t border-slate-100 p-6 text-center space-y-2">
            <p className="text-slate-400 text-xs font-semibold tracking-wider">CHỈ DÀNH CHO NHÂN VIÊN ĐƯỢC ỦY QUYỀN</p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
              <a href="#" className="hover:text-orange-600 transition-colors">Chính Sách Bảo Mật</a>
              <span className="text-slate-300">•</span>
              <a href="#" className="hover:text-orange-600 transition-colors">Trạng Thái Hệ Thống</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Brand showcase */}
      <div className="hidden md:flex md:col-span-5 relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-amber-950 to-orange-950" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400/40 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full w-full p-10 lg:p-12">
          {/* Logo chính */}
          <div className="flex flex-col items-center pt-2">
            <div className="relative w-full max-w-[280px] h-[72px] bg-white rounded-2xl shadow-2xl shadow-black/20 px-6 py-3 flex items-center justify-center ring-1 ring-white/80">
              <Image
                src="/logo.png?v=2"
                alt="Express Cafe Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <p className="mt-4 text-amber-100/90 text-sm font-medium tracking-wide text-center">
              Mỹ thuật Rang Xay &amp; Công nghệ SAAS
            </p>
          </div>

          {/* Lưới ảnh thương hiệu */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
              {BRAND_SHOWCASE.map((item, i) => (
                <div
                  key={item.src}
                  className={`group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/10 ${
                    i % 2 === 0 ? 'translate-y-2' : '-translate-y-2'
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <p className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] font-bold text-white leading-tight drop-shadow-sm">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Thẻ mô tả */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-lg font-bold text-white tracking-tight">Express Cafe</h3>
            </div>
            <p className="text-amber-50/85 text-sm leading-relaxed">
              Hương vị cà phê truyền thống đậm đà hòa quyện cùng công nghệ quản trị hiện đại,
              mang đến sự hoàn hảo trong từng điểm chạm dịch vụ.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Nhượng quyền', 'Chi nhánh', 'Dịch vụ', 'Tin tức'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-amber-100/90 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
