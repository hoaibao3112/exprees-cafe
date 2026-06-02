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
import { resolveUploadUrl } from '../../lib/api';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

type RegionFilter = 'ALL' | 'CENTER' | 'EAST' | 'OTHERS';

export default function BranchesPage() {
  // Activate scroll animations
  useScrollAnimation();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('ALL');
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/branches')
      .then(res => res.json())
      .then(data => {
        // Handle different response formats
        const branchesData = Array.isArray(data) ? data : (data.data || []);
        setBranches(branchesData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading branches:', err);
        setIsLoading(false);
      });
  }, []);

  // Helper to categorize branches into regions for smart filtering
  const getBranchRegion = (branch: any): RegionFilter => {
    const name = (branch.name || '').toLowerCase();
    const desc = (branch.description || '').toLowerCase();
    
    if (
      name.includes('quận 1') || name.includes('quận 3') || name.includes('quận 5') ||
      desc.includes('quận 1') || desc.includes('quận 3') || desc.includes('quận 5')
    ) {
      return 'CENTER';
    }
    
    if (
      name.includes('quận 9') || name.includes('thủ đức') ||
      desc.includes('quận 9') || desc.includes('thủ đức')
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
        className="relative w-full h-[180px] md:h-[220px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider leading-none" data-animate="blur-in">
            Các Chi Nhánh
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Danh sách chi nhánh</span>
          </div>
        </div>
        
        {/* Decorative Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-8 fill-zinc-50" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
          </svg>
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
                data-delay={String(((index % 3) + 1) * 100)}
                className="group bg-white rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <img 
                      src={branch.images && branch.images.length > 0 ? resolveUploadUrl(branch.images[0]) : (branch.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500&auto=format&fit=crop')} 
                      alt={branch.name}
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
