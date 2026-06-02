'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFranchisePackageByIdQuery } from '../../../hooks/useFranchiseQueries';
import { resolveUploadUrl } from '../../../lib/api';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ArrowRight, CheckCircle, ArrowLeft, Coffee, Gift, Monitor, Store, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function FranchiseDetailPage(props: { params: { id: string } }) {
  // Next may pass `params` as a Promise in client components — unwrap with React.use()
  const resolvedParams = React.use(props.params as any) as { id: string };
  const { id } = resolvedParams;

  const { data: pkg, isLoading, error } = useFranchisePackageByIdQuery(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Debug log
  React.useEffect(() => {
    console.log('Franchise package data:', pkg);
    console.log('Package images:', pkg?.images);
  }, [pkg]);

  const packageImages = pkg?.images && pkg.images.length > 0 ? pkg.images.map((p: string) => resolveUploadUrl(p)) : ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Đang tải thông tin gói nhượng quyền...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading franchise package:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi tải gói nhượng quyền: {error.message}</p>
          <Link href="/franchise" className="text-orange-500 hover:underline">
            Quay lại trang nhượng quyền
          </Link>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không tìm thấy gói nhượng quyền</p>
          <Link href="/franchise" className="text-orange-500 hover:underline">
            Quay lại trang nhượng quyền
          </Link>
        </div>
      </div>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? packageImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === packageImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/franchise" className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách gói
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Package Info */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[400px]">
                <img
                  src={packageImages[currentImageIndex]}
                  alt={`${pkg.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Navigation Arrows */}
                {packageImages.length > 1 && (
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
                {packageImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    {currentImageIndex + 1} / {packageImages.length}
                  </div>
                )}

                {/* Package Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                    {pkg.modelType}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {pkg.name}
                  </h1>
                  <p className="text-white/90 text-sm">
                    Vốn đầu tư từ{' '}
                    <span className="font-bold text-orange-400">
                      {Number(pkg.investmentFrom).toLocaleString('vi-VN')} đ
                    </span>
                  </p>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {packageImages.length > 1 && (
                <div className="flex gap-2 p-4 bg-zinc-50">
                  {packageImages.map((img, idx) => (
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
                Mô tả gói đầu tư
              </h2>
              <p className="text-zinc-600 leading-relaxed">{pkg.description}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/franchise/register?packageId=${pkg.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Đăng ký nhượng quyền ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm uppercase tracking-wider rounded-2xl transition-all"
              >
                Tìm hiểu thêm
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900 mb-6">Quyền lợi & Hỗ trợ</h2>

            {/* Feature 1 - Full System */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-6 border border-orange-100 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-2">HỆ THỐNG NHƯỢNG QUYỀN TRỌN GÓI</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Cung cấp trọn gói từ thiết kế, thi công, trang thiết bị, nguyên liệu đến đào tạo vận hành.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Brand Kit */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-6 border border-amber-100 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-2">TÀI TRỢ 100% BỘ NHẬN DIỆN THƯƠNG HIỆU TRỊ GIÁ 5 TRIỆU</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Logo, biển hiệu, menu, đồng phục, bao bì sản phẩm - tất cả được thiết kế chuyên nghiệp.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Software */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 border border-emerald-100 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-2">TẶNG PHẦN MỀM QUẢN LÝ TRỊ GIÁ 2 TRIỆU</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Hệ thống POS hiện đại, quản lý tồn kho, báo cáo doanh thu, CRM tích hợp sẵn.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 - Branch Network */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-blue-100 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-2">CÁC CHI NHÁNH NHƯỢNG QUYỀN CỦA EXPRESS CAFE</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Hệ thống 15+ chi nhánh hoạt động hiệu quả, hỗ trợ chia sẻ kinh nghiệm thực tế.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Benefits */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                Các quyền lợi khác
              </h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Đào tạo pha chế và vận hành miễn phí</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Hỗ trợ marketing và mở cửa hàng</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Cung cấp nguyên liệu giá sỉ ưu đãi</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span>Bảo hành thiết bị 12 tháng</span>
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
