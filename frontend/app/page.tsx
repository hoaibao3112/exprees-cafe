import Link from 'next/link';
import { Coffee, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-900 text-zinc-100 font-sans">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/10 blur-[120px] animate-pulse-slow"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Express Cafe
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold hover:text-white transition-colors">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-md shadow-indigo-600/20">
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Hệ thống Quản lý & Bán hàng F&B SaaS Premium
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
          Nâng Tầm Trải Nghiệm <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Thưởng Thức Cà Phê
          </span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-2xl mb-12 leading-relaxed">
          Nền tảng đặt hàng trực tuyến tích hợp tích điểm đổi quà thành viên (Loyalty Points), định vị chi nhánh thông minh và quản lý nhượng quyền F&B tối ưu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/register" className="group flex h-14 items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-8 text-base font-bold text-white transition-all shadow-xl shadow-indigo-600/30">
            Khám phá ngay
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-8 text-base font-bold transition-all">
            Đăng nhập tài khoản
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-2xl">
            <Coffee className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-bold text-base mb-2">Menu Đa Dạng</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Thực đơn phong phú với các món nước pha chế đặc biệt, cập nhật liên tục theo mùa.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-bold text-base mb-2">Tích Điểm Thành Viên</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Đăng ký nhận ngay 100 điểm thưởng. Đổi nước miễn phí và quà tặng VIP không giới hạn.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl">
            <CreditCard className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-bold text-base mb-2">Giao Hàng Nhanh Chóng</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Tìm chi nhánh gần nhất, đặt hàng nhận nước ngay tại quầy hoặc giao hàng tận nơi tiện lợi.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-8 border-t border-white/5 text-zinc-500 text-xs">
        © 2026 Express Cafe Corporation. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}
