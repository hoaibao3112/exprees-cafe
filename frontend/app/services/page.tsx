'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { resolveUploadUrl } from '../../lib/api';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export default function ServicesPage() {
  // Activate scroll animations
  useScrollAnimation();

  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/services')
      .then(res => res.json())
      .then(data => {
        // Handle different response formats
        const servicesData = Array.isArray(data) ? data : (data.data || []);
        setServices(servicesData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading services:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[180px] md:h-[220px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=1200')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider leading-none" data-animate="blur-in">
            Các Dịch Vụ
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Các dịch vụ</span>
          </div>
        </div>
        
        {/* Decorative Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-8 fill-zinc-50" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
          </svg>
        </div>
      </section>

      {/* 3. Services Listing Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        
        {/* Descriptive Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-animate="fade-up">
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3.5 py-1.5 rounded-full">
            Giải pháp F&B chuyên nghiệp
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-zinc-950 mt-4 leading-tight tracking-tight">
            Chúng Tôi Đồng Hành Cùng Bạn
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-3 leading-relaxed">
            Express Cafe mang đến hệ sinh thái sản phẩm, nguyên vật liệu và giải pháp kỹ thuật công nghệ toàn diện giúp bạn vận hành kinh doanh quán đạt hiệu quả tối ưu và bền vững.
          </p>
        </div>

        {/* Dynamic Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 p-4 shadow-sm animate-pulse">
                <div className="w-full aspect-[4/3] bg-zinc-200 rounded-2xl mb-4" />
                <div className="h-6 bg-zinc-200 rounded w-2/3 mb-2" />
                <div className="h-12 bg-zinc-200 rounded mb-4" />
                <div className="h-10 bg-zinc-200 rounded-2xl w-full" />
              </div>
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
                data-delay={String(((index % 3) + 1) * 100)}
                className="group bg-white rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <img 
                      src={service.images && service.images.length > 0 ? resolveUploadUrl(service.images[0]) : (service.imageUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=500&auto=format&fit=crop')} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6">
                    <h3 className="font-extrabold text-base text-zinc-950 group-hover:text-orange-500 transition-colors duration-355 leading-tight">
                      {service.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-3 leading-relaxed line-clamp-3 min-h-[3.3rem] font-light">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Card Button Footer */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/services/${service.id}`}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider text-center rounded-2xl transition-all duration-300 shadow-md shadow-orange-500/10 inline-block"
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
