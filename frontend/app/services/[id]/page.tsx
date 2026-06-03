'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { resolveUploadUrl, apiFetch } from '../../../lib/api';
import { ArrowLeft, ChevronLeft, ChevronRight, Coffee, CheckCircle2, MessageSquare, X } from 'lucide-react';

export default function ServiceDetailPage(props: { params: Promise<{ id: string }> }) {
  useScrollAnimation();
  const resolvedParams = React.use(props.params);
  const id = resolvedParams.id;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setService(null);
    apiFetch<any>(`/services/${id}`)
      .then(data => {
        setService(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading service:', err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="space-y-6">
              <div className="w-full h-[400px] bg-zinc-200 rounded-3xl" />
              <div className="flex gap-2">
                <div className="w-20 h-20 bg-zinc-200 rounded-lg" />
                <div className="w-20 h-20 bg-zinc-200 rounded-lg" />
                <div className="w-20 h-20 bg-zinc-200 rounded-lg" />
              </div>
              <div className="h-6 bg-zinc-200 rounded w-1/3" />
              <div className="h-24 bg-zinc-200 rounded-3xl" />
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-zinc-200 rounded w-1/2" />
              <div className="h-28 bg-zinc-200 rounded-3xl" />
              <div className="h-24 bg-zinc-200 rounded-3xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không tìm thấy dịch vụ</p>
          <Link href="/services" className="text-orange-500 hover:underline">
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const serviceImages = service.images && service.images.length > 0 
    ? service.images.map((img: string) => resolveUploadUrl(img)) 
    : (service.imageUrl 
        ? [resolveUploadUrl(service.imageUrl)] 
        : ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800']);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? serviceImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === serviceImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/services" className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách dịch vụ
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Service Info */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[400px]">
                <img
                  src={serviceImages[currentImageIndex]}
                  alt={`${service.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Navigation Arrows */}
                {serviceImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-zinc-800" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-zinc-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {serviceImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {currentImageIndex + 1} / {serviceImages.length}
                  </div>
                )}

                {/* Service Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                    Dịch vụ
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {service.name}
                  </h1>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {serviceImages.length > 1 && (
                <div className="flex gap-2 p-4 bg-zinc-50">
                  {serviceImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? 'ring-2 ring-orange-500 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-zinc-50 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-orange-500" />
                Mô tả dịch vụ
              </h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://c439f6n0z9h.sg.larksuite.com/share/base/form/shrlgCqbXhTIu8D7489D9Unc2Bc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Đăng ký tư vấn dịch vụ
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </a>
            </div>
          </div>

          {/* Right Column - Benefits */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900 mb-6">Quyền lợi & Hỗ trợ</h2>

            {/* Benefits List */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-400" />
                Các quyền lợi
              </h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Hỗ trợ tư vấn chuyên nghiệp 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Giá cả cạnh tranh và minh bạch</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Chất lượng dịch vụ đảm bảo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Bảo hành và hỗ trợ sau dịch vụ</span>
                </li>
              </ul>
            </div>

            {/* Contact Form - Larksuite Redirection */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl flex flex-col gap-4 shadow-md text-center items-center py-8">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-zinc-900 uppercase tracking-wide">
                Đăng Ký Tư Vấn Dịch Vụ
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs font-light">
                Quý khách vui lòng cung cấp thông tin liên hệ và yêu cầu tư vấn thông qua biểu mẫu khảo sát Lark của chúng tôi.
              </p>
              
              <a
                href="https://c439f6n0z9h.sg.larksuite.com/share/base/form/shrlgCqbXhTIu8D7489D9Unc2Bc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98] shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                Mở biểu mẫu đăng ký Lark
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
