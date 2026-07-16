'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Phone, Clock, Map, Coffee, CheckCircle2 } from 'lucide-react';

import { resolveUploadUrl, apiFetch } from '../../../lib/api';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';

interface BranchData {
  id: string;
  name: string;
  address: string;
  phone: string;
  openTime: string;
  description: string;
  imageUrl: string | null;
  images: string[];
  features: string[];
}

const MOCK_BRANCHES: Record<string, BranchData> = {
  'branch-1': {
    id: 'branch-1',
    name: 'Express Cafe – Quận 1',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '028 1234 5678',
    openTime: '6h30 – 22h30 (Thứ 2 – Chủ nhật)',
    description: 'Chi nhánh Express Cafe Quận 1 tọa lạc ngay trung tâm thành phố, nơi giao thoa của những con phố sầm uất bậc nhất Sài Gòn. Không gian thiết kế hiện đại, thoáng mát với tầm nhìn hướng ra phố đi bộ Nguyễn Huệ – lý tưởng để thưởng thức cà phê đặc trưng của Express Cafe giữa nhịp sống năng động.',
    imageUrl: '/media__1780386795847.png',
    images: ['/media__1780386795847.png', '/media__1780386795859.png'],
    features: ['Cà phê máy chất lượng cao', 'Không gian hiện đại 2 tầng', 'Wi-Fi miễn phí tốc độ cao', 'Chỗ đậu xe thuận tiện', 'Nhân viên phục vụ chuyên nghiệp']
  },
  'branch-2': {
    id: 'branch-2',
    name: 'Express Cafe – Quận 3',
    address: '45 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
    phone: '028 9876 5432',
    openTime: '6h30 – 22h00 (Thứ 2 – Chủ nhật)',
    description: 'Nằm trên con phố Võ Văn Tần yên tĩnh và thơ mộng của Quận 3, Express Cafe chi nhánh này mang đến không gian cà phê boutique ấm cúng với thiết kế mộc mạc kết hợp hiện đại. Đây là điểm hẹn lý tưởng cho những buổi làm việc cá nhân, gặp gỡ bạn bè hay đơn giản là tìm một góc yên tĩnh giữa lòng thành phố.',
    imageUrl: '/media__1780386795859.png',
    images: ['/media__1780386795859.png', '/media__1780386795867.png', '/media__1780386795847.png'],
    features: ['Cà phê chuyên biệt từ hạt Robusta Đắk Lắk', 'Góc làm việc yên tĩnh riêng tư', 'Wi-Fi tốc độ cao miễn phí', 'Menu đồ uống phong phú 40+ món', 'Giao hàng tận nơi trong bán kính 3km']
  },
  'branch-3': {
    id: 'branch-3',
    name: 'Express Cafe – Thủ Đức',
    address: '78 Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
    phone: '028 5555 1234',
    openTime: '6h00 – 23h00 (Thứ 2 – Chủ nhật)',
    description: 'Chi nhánh Thủ Đức – cửa hàng Express Cafe lớn nhất khu vực phía Đông với diện tích hơn 200m², sức chứa 80 khách. Khu vực này tập trung đông đảo sinh viên và cư dân trẻ, tạo nên một không khí năng động và sáng tạo. Phục vụ cả sáng – chiều – tối với đa dạng lựa chọn cà phê và thức uống.',
    imageUrl: '/media__1780386795867.png',
    images: ['/media__1780386795867.png', '/media__1780386795847.png'],
    features: ['Không gian rộng 200m² – 80 khỗ ngồi', 'Khu vực ngoài trời thoáng mát', 'Sân khấu nhỏ biểu diễn cuối tuần', 'Wi-Fi miễn phí & ổ cắm điện đầy đủ', 'Giao hàng nhanh toàn khu Thủ Đức']
  }
};

export default function BranchDetailPage(props: { params: Promise<{ id: string }> }) {
  useScrollAnimation();
  const resolvedParams = React.use(props.params);
  const { id } = resolvedParams as { id: string };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [branch, setBranch] = useState<BranchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setBranch(null);
    setCurrentImageIndex(0);
    apiFetch<BranchData>(`/branches/${id}`)
      .then(data => {
        setBranch(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('API offline, falling back to mock branch data:', err);
        // Tìm mock theo id, nếu không có thì lấy branch-2 mặc định
        const fallback = MOCK_BRANCHES[id] ?? MOCK_BRANCHES['branch-2'];
        setBranch(fallback);
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

  const branchImages =
    branch.images && branch.images.length > 0
      ? branch.images.map((img: string) => resolveUploadUrl(img))
      : branch.imageUrl
      ? [resolveUploadUrl(branch.imageUrl)]
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
          {/* Left Column - Image + Description */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[420px]">
                <OptimizedImage
                  src={branchImages[currentImageIndex]}
                  alt={`${branch.name} - Ảnh ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover transition-all duration-300"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

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

                {/* Branch Name Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3">
                    Chi nhánh Express Cafe
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white">
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
                      className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${
                        idx === currentImageIndex
                          ? 'ring-2 ring-orange-500 ring-offset-2'
                          : 'opacity-55 hover:opacity-100'
                      }`}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div data-animate="fade-up" className="bg-zinc-50 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-orange-500" />
                Giới thiệu chi nhánh
              </h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{branch.description}</p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || branch.name)}`}
                target="_blank"
                rel="noreferrer"
                className="spotlight-wrapper flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Chỉ đường trên Google Maps
                <Map className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column - Branch Details */}
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-zinc-900">Thông tin chi tiết</h2>

            {/* Địa chỉ */}
            <div
              data-animate="fade-up"
              data-delay="100"
              className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Địa chỉ</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{branch.address}</p>
                </div>
              </div>
            </div>

            {/* Giờ hoạt động */}
            <div
              data-animate="fade-up"
              data-delay="200"
              className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Giờ hoạt động</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {(branch as any).openingHours
                      ? `${(branch as any).openingHours.open} – ${(branch as any).openingHours.close}`
                      : branch.openTime || '07:00 – 17:00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Liên hệ */}
            <div
              data-animate="fade-up"
              data-delay="300"
              className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 mb-1">Liên hệ</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Hotline: <span className="font-semibold text-orange-500">{branch.phone}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Đặc điểm chi nhánh */}
            <div
              data-animate="fade-up"
              data-delay="400"
              className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-zinc-900">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                Đặc điểm chi nhánh
              </h3>
              <ul className="space-y-3">
                {(branch.features ?? [
                  'Cà phê máy chất lượng cao',
                  'Không gian hiện đại, thoải mái',
                  'Wi-Fi miễn phí',
                  'Chỗ đậu xe thuận tiện',
                ]).map((feat: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-500">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
