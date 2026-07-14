'use client';

import { Coffee, Award, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export function StatsSection() {
  return (
    <section className="relative py-24 bg-white text-zinc-800 overflow-hidden border-t border-zinc-100">
      {/* Background wood flooring styling pattern */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200')` }}
      />
      <div className="absolute bottom-0 right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Stats list với gradient text */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-4 sm:gap-6 text-center" data-animate="fade-up">
            <div className="flex flex-col items-center bg-zinc-50/70 backdrop-blur-md p-6 rounded-3xl border border-orange-100/60 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 shadow-inner">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                <AnimatedCounter end={40} suffix="M+" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2.5 leading-tight">Ly Cà Phê Bán Ra</span>
            </div>
            
            <div className="flex flex-col items-center bg-zinc-50/70 backdrop-blur-md p-6 rounded-3xl border border-orange-100/60 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                <AnimatedCounter end={20} suffix="+" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2.5 leading-tight">Sự Kiện Đồng Hành</span>
            </div>

            <div className="flex flex-col items-center bg-zinc-50/70 backdrop-blur-md p-6 rounded-3xl border border-orange-100/60 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-2xl sm:text-4xl font-black gradient-text tracking-tight">
                <AnimatedCounter end={9} suffix="+" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-2.5 leading-tight">Năm Phát Triển</span>
            </div>
          </div>

          {/* Story Box (Right) */}
          <div className="lg:col-span-6" data-animate="scale-up" data-delay="150">
            <div className="p-8 border border-zinc-200/80 rounded-[32px] bg-zinc-50/45 backdrop-blur-md relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Ambient glow */}
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-lg font-black tracking-widest text-[#f07b22] mb-4 uppercase">
                EXPRESS CAFE
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-light">
                Express Cafe tự hào mang đến nguồn sinh khí mới, năng động và đẳng cấp trong phong cách thưởng thức cà phê hiện đại. Chúng tôi kiến tạo nên một nền tảng bán hàng và vận hành thông minh từ xa, mang lại lợi ích thực tiễn cao nhất và bền vững cho mọi đối tác nhượng quyền đồng hành trên cả nước.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
