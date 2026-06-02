'use client';

import { useState } from 'react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { Building, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';

export default function FranchiseRegisterPage() {
  useScrollAnimation();
  const [iframeLoading, setIframeLoading] = useState(true);

  const LARK_FORM_URL = 'https://c439f6n0z9h.sg.larksuite.com/share/base/form/shrlgCqbXhTIu8D7489D9Unc2Bc';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Navigation Header */}
      <Header />

      {/* 2. Breadcrumbs Header */}
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

      {/* 3. Main Lark Form Section */}
      <main className="max-w-4xl mx-auto px-4 w-full py-12 flex-1">
        <div 
          className="bg-white border border-zinc-200 rounded-[32px] p-6 md:p-8 shadow-2xl shadow-zinc-200/50 relative overflow-hidden"
          data-animate="scale-up"
        >
          {/* Top subtle decorative ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-[#e9762b]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#e9762b] shrink-0 shadow-sm">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-zinc-900">ĐĂNG KÝ HỢP TÁC NHƯỢNG QUYỀN</h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-semibold">Vui lòng hoàn thành biểu mẫu khảo sát Lark bên dưới</p>
              </div>
            </div>
            
            <a 
              href={LARK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold text-zinc-600 transition-colors shadow-sm"
            >
              Mở tab mới
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Responsive Embedded Iframe */}
          <div className="relative w-full h-[650px] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-150">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-20">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Đang tải biểu mẫu Lark...</p>
              </div>
            )}
            <iframe 
              src={LARK_FORM_URL}
              className="w-full h-full border-none z-10"
              onLoad={() => setIframeLoading(false)}
              title="Larksuite Franchise Registration Form"
            />
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

    </div>
  );
}
