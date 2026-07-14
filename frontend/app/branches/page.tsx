'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Coffee, 
  ArrowLeft, 
  ChevronRight,
  Sparkles,
  Map,
  X
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { resolveUploadUrl, apiFetch } from '../../lib/api';
import { useBannersQuery } from '../../hooks/useContentQueries';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { OptimizedImage } from '../../components/ui/OptimizedImage';

type RegionFilter = 'ALL' | 'CENTER' | 'EAST' | 'OTHERS';

export default function BranchesPage() {
  // Activate scroll animations
  useScrollAnimation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('ALL');
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: banners = [] } = useBannersQuery();
  const activeBanner = banners.find((b) => b.position === 'BRANCHES_HERO');
  const bgImage = activeBanner ? resolveUploadUrl(activeBanner.imageUrl) : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200';
  const pageTitle = activeBanner ? activeBanner.title : 'Các Chi Nhánh';
  const pageSubtitle = activeBanner ? activeBanner.linkUrl : '';

  const renderTitle = () => {
    const words = pageTitle.split(' ');
    if (words.length <= 1) return <span className="text-white">{pageTitle}</span>;
    // Split branches page title cleanly
    const splitIndex = Math.ceil(words.length / 2);
    const whiteText = words.slice(0, splitIndex).join(' ');
    const orangeText = words.slice(splitIndex).join(' ');
    return (
      <>
        <span className="text-white">{whiteText} </span>
        <span className="text-[#f07b22]">{orangeText}</span>
      </>
    );
  };

  const MOCK_BRANCHES = [
    {
      id: 'branch-1',
      name: 'Express Cafe - Bến Thành',
      address: '120 Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop',
      description: 'Nằm ngay trung tâm Quận 1 sầm uất, không gian rộng rãi phù hợp gặp gỡ đối tác.'
    },
    {
      id: 'branch-2',
      name: 'Express Cafe - Dân Chủ',
      address: '25 Dân Chủ, Phường Bình Thọ, TP. Thủ Đức',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=500&auto=format&fit=crop',
      description: 'Mô hình Kiosk kết hợp máy pha hiện đại phục vụ nhu cầu mang đi và ngồi tại chỗ.'
    },
    {
      id: 'branch-3',
      name: 'Express Cafe - Cao Thắng',
      address: '48 Cao Thắng, Phường 3, Quận 3, TP. HCM',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop',
      description: 'Phong cách ấm cúng, menu phong phú phù hợp cho làm việc và học tập.'
    }
  ];

  useEffect(() => {
    apiFetch<any[]>('/branches')
      .then(data => {
        setBranches(data && data.length > 0 ? data : MOCK_BRANCHES);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('API /branches offline, falling back to mock data:', err);
        setBranches(MOCK_BRANCHES);
        setIsLoading(false);
      });
  }, []);

  // Helper to categorize branches into regions for smart filtering
  const getBranchRegion = (branch: any): RegionFilter => {
    const name = (branch.name || '').toLowerCase();
    const desc = (branch.description || '').toLowerCase();
    const addr = (branch.address || '').toLowerCase();
    
    if (
      name.includes('quận 1') || name.includes('quận 3') || name.includes('quận 5') ||
      desc.includes('quận 1') || desc.includes('quận 3') || desc.includes('quận 5') ||
      addr.includes('quận 1') || addr.includes('quận 3') || addr.includes('quận 5')
    ) {
      return 'CENTER';
    }
    
    if (
      name.includes('quận 9') || name.includes('thủ đức') ||
      desc.includes('quận 9') || desc.includes('thủ đức') ||
      addr.includes('quận 9') || addr.includes('thủ đức')
    ) {
      return 'EAST';
    }
    
    return 'OTHERS';
  };

  // Filter based on search input and region tabs
  const filteredBranches = (branches || []).filter((branch) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (branch.name || '').toLowerCase().includes(q) ||
      (branch.description || '').toLowerCase().includes(q);
      
    if (activeRegion === 'ALL') return matchesSearch;
    return matchesSearch && getBranchRegion(branch) === activeRegion;
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[240px] md:h-[320px] bg-zinc-950 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url(${bgImage})`,
          backgroundPosition: 'center 50%',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          {pageSubtitle && (
            <span 
              className="inline-block text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-orange-400 mb-3 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20"
              data-animate="fade-down"
            >
              {pageSubtitle}
            </span>
          )}
          
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider leading-none" data-animate="blur-in">
            {renderTitle()}
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Danh sách chi nhánh</span>
          </div>
        </div>
      </section>

      {/* 3. Filtering & Listing Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          
          {/* Region Tabs */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveRegion('ALL')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-300 shadow-sm cursor-pointer active:scale-95 ${
                activeRegion === 'ALL'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-zinc-200 text-zinc-650 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/10'
              }`}
            >
              TẤT CẢ KHU VỰC
            </button>
            <button
              onClick={() => setActiveRegion('CENTER')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-300 shadow-sm cursor-pointer active:scale-95 ${
                activeRegion === 'CENTER'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-zinc-200 text-zinc-650 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/10'
              }`}
            >
              TRUNG TÂM (Q.1, Q.3, Q.5)
            </button>
            <button
              onClick={() => setActiveRegion('EAST')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-300 shadow-sm cursor-pointer active:scale-95 ${
                activeRegion === 'EAST'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-zinc-200 text-zinc-650 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/10'
              }`}
            >
              KHU ĐÔNG (Q.9, THỦ ĐỨC)
            </button>
            <button
              onClick={() => setActiveRegion('OTHERS')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all duration-300 shadow-sm cursor-pointer active:scale-95 ${
                activeRegion === 'OTHERS'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white border border-zinc-200 text-zinc-650 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/10'
              }`}
            >
              KHU VỰC KHÁC
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chi nhánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-full text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm transition-all"
            />
          </div>

        </div>

        {/* Dynamic Branch Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 p-4 shadow-sm animate-pulse">
                <div className="w-full aspect-[4/3] bg-zinc-200 rounded-2xl mb-4" />
                <div className="h-6 bg-zinc-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-zinc-200 rounded w-1/2 mb-4" />
                <div className="h-10 bg-zinc-200 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-lg mx-auto shadow-sm" data-animate="scale-up">
            <MapPin className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="font-bold text-base text-zinc-700">Không tìm thấy chi nhánh nào</h3>
            <p className="text-xs text-zinc-400 mt-1">Vui lòng thử từ khóa tìm kiếm hoặc lọc theo khu vực khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBranches.map((branch, index) => (
              <div 
                key={branch.id || index}
                data-animate="fade-up"
                data-delay={String(((index % 3) + 1) * 150)}
                className="card-tilt group bg-white rounded-3xl border border-zinc-150 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <OptimizedImage 
                      src={branch.images && branch.images.length > 0 ? resolveUploadUrl(branch.images[0]) : (resolveUploadUrl(branch.imageUrl) || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop')} 
                      alt={branch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6">
                    <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-orange-500 transition-colors duration-350 line-clamp-1 leading-tight">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 flex items-start gap-1.5 leading-relaxed line-clamp-2 min-h-[2.5rem] font-light">
                      <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{branch.address || (branch.description?.split('Địa chỉ:')?.[1]?.split('\n')[0] || 'Liên hệ chi nhánh')}</span>
                    </p>
                  </div>
                </div>

                {/* Card Button Footer */}
                <div className="p-6 pt-0 mt-2">
                  <Link
                    href={`/branches/${branch.id}`}
                    className="spotlight-wrapper w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider text-center rounded-xl transition-all duration-300 shadow-md shadow-orange-500/10 inline-block"
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
