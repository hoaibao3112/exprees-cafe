'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Phone, Clock, Map, Coffee, CheckCircle2 } from 'lucide-react';

import { resolveUploadUrl } from '../../../lib/api';

export default function BranchDetailPage(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(props.params);
  const { id } = resolvedParams as { id: string };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [branch, setBranch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setBranch(null);
    fetch(`http://localhost:3000/api/v1/branches/${id}`)
      .then(res => res.json())
      .then(data => {
        // Backend may return { success: true, data: { ... } } or the branch object directly
        setBranch(data?.data ?? data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading branch:', err);
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

  if (!branch) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không tìm thấy chi nhánh</p>
          <Link href="/branches" className="text-orange-500 hover:underline">
            Quay lại danh sách chi nhánh
          </Link>
        </div>
      </div>
    );
  }

  const branchImages = branch.images && branch.images.length > 0 
    ? branch.images.map((img: string) => resolveUploadUrl(img)) 
    : ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800'];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? branchImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === branchImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/branches" className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách chi nhánh
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Branch Info */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[400px]">
                <img
                  src={branchImages[currentImageIndex]}
                  alt={`${branch.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Navigation Arrows */}
                {branchImages.length > 1 && (
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
                {branchImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {currentImageIndex + 1} / {branchImages.length}
                  </div>
                )}

                {/* Branch Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                    Chi nhánh
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {branch.name}
                  </h1>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {branchImages.length > 1 && (
                <div className="flex gap-2 p-4 bg-zinc-50">
                  {branchImages.map((img: string, idx: number) => (
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
                Giới thiệu chi nhánh
              </h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{(branch.description ?? '')}</p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Chỉ đường trên Google Maps
                <Map className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column - Branch Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900 mb-6">Thông tin chi tiết</h2>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-6 border border-orange-100 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Địa chỉ</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {(() => {
                        const desc = String(branch.description ?? '');
                        const addr = desc.includes('Địa chỉ:')
                          ? desc.split('Địa chỉ:')[1]?.split('\n')[0]
                          : branch.address;
                        return addr || 'Liên hệ chi nhánh';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 border border-emerald-100 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Giờ hoạt động</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {(() => {
                        const desc = String(branch.description ?? '');
                        if (desc.includes('Giờ hoạt động')) {
                          return desc.split('Giờ hoạt động:')[1]?.split('\n')[0] || '6h30 - 22h30';
                        }
                        return '6h30 - 22h30';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Liên hệ</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Hotline: 1900 xxxx
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-400" />
                Đặc điểm chi nhánh
              </h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Cà phê máy chất lượng cao</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Không gian hiện đại, thoải mái</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Wi-Fi miễn phí</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Chỗ đậu xe thuận tiện</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
