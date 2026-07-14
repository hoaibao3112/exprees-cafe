'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { resolveUploadUrl, apiFetch } from '../../lib/api';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  images?: string[];
}

import { useServicesQuery } from '../../hooks/useServicesQueries';

export default function ServicesPage() {
  // Activate scroll animations
  useScrollAnimation();

  const { data: services = [], isLoading } = useServicesQuery();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Enhanced Hero Banner Section */}
      <section 
        className="relative w-full h-[240px] md:h-[320px] bg-zinc-950 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=1200')`,
          backgroundPosition: 'center 62%',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <span 
            className="inline-block text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-orange-400 mb-3 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20"
            data-animate="fade-down"
          >
            Express Cafe Services
          </span>
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider leading-tight drop-shadow-md" data-animate="blur-in">
            <span className="text-white">Dịch vụ </span>
            <span className="text-[#f07b22]">của chúng tôi</span>
          </h1>
          
          <div className="w-16 h-1 bg-orange-500 mx-auto my-4 rounded-full" data-animate="scale-up" data-delay="200" />
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs md:text-sm font-medium mt-4 bg-black/35 backdrop-blur-md py-2 px-5 rounded-full w-max mx-auto shadow-sm" data-animate="fade-up" data-delay="300">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3 text-zinc-500" />
            <span className="text-orange-400 font-bold">Các dịch vụ</span>
          </div>
        </div>
      </section>

      {/* 3. Services Listing Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        
        {/* Descriptive Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-3.5 py-1.5 rounded-full">
            Giải pháp F&B chuyên nghiệp
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-zinc-950 mt-4 leading-tight tracking-tight">
            Chúng Tôi Đồng Hành Cùng Bạn
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-4 leading-relaxed font-light">
            Express Cafe mang đến hệ sinh thái sản phẩm, nguyên vật liệu và giải pháp kỹ thuật công nghệ toàn diện giúp bạn vận hành kinh doanh quán đạt hiệu quả tối ưu và bền vững.
          </p>
        </div>

        {/* Dynamic Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm animate-pulse h-[380px]" />
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-lg mx-auto shadow-sm" data-animate="scale-up">
            <Coffee className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="font-bold text-base text-zinc-700">Chưa có dịch vụ nào</h3>
            <p className="text-xs text-zinc-400 mt-1">Hệ thống đang được cập nhật thêm các gói dịch vụ mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.id || index}
                data-animate="fade-up"
                data-delay={String(((index % 3) + 1) * 150)}
                className="group bg-white rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-200 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col justify-between h-full"
              >
                <div>
                  {/* Card Banner Image with perfect crop config */}
                  <div className="relative h-60 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <OptimizedImage 
                      src={service.imageUrl ? resolveUploadUrl(service.imageUrl) : '/p-about-sv_1.jpg'} 
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-8">
                    <h3 className="font-extrabold text-base md:text-lg text-zinc-900 group-hover:text-orange-500 transition-colors duration-300 leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-3 leading-relaxed line-clamp-3 min-h-[3.3rem] font-light">
                      {service.description ? service.description.replace(/<[^>]*>/g, '') : ''}
                    </p>
                  </div>
                </div>

                {/* Card Button Footer */}
                <div className="p-8 pt-0">
                  <Link
                    href={`/services/${service.id}`}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider text-center rounded-xl transition-all duration-300 shadow-md shadow-orange-500/10 inline-block hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}
