'use client';

import { useState } from 'react';
import { useBranchesQuery, useNearestBranchesQuery, Branch } from '../../hooks/useBranchQueries';
import { MapPin, Navigation, Phone, Clock, Search, Coffee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch all branches
  const { data: branches, isLoading } = useBranchesQuery();

  // Fetch nearest branches if user geolocation is retrieved
  const { data: nearestBranches, isLoading: isLoadingNearest } = useNearestBranchesQuery(
    userCoords?.lat || 0,
    userCoords?.lng || 0,
    50, // 50km
    !!userCoords,
  );

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị GPS');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback mockup coordinates for simulation (District 1 HCMC area)
        setUserCoords({ lat: 10.776, lng: 106.701 });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const isBranchOpen = (openingHours?: { open: string; close: string }): boolean => {
    if (!openingHours) return true;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;

    const [openH, openM] = openingHours.open.split(':').map(Number);
    const [closeH, closeM] = openingHours.close.split(':').map(Number);
    
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  // Decide which list to show
  const activeBranchesList = userCoords ? nearestBranches : branches;

  // Filter based on search input
  const filteredBranches = (activeBranchesList || []).filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                EXPRESS CAFE
              </span>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            Tài Khoản
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Tìm Cửa Hàng
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Khám phá hệ thống cửa hàng Express Cafe. Xem địa chỉ, chỉ đường và tìm chi nhánh gần bạn nhất.
          </p>
        </div>

        {/* Action and Search bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên cửa hàng, đường phố, quận huyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all"
            />
          </div>
          <div className="md:col-span-4">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/20 backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Đang tìm kiếm vị trí...' : 'Tìm cửa hàng gần đây'}
            </button>
          </div>
        </div>

        {locationError && (
          <div className="mb-6 p-4 rounded-xl border border-red-900/30 bg-red-950/20 text-red-400 text-sm">
            {locationError}
          </div>
        )}

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Outlet List */}
          <div className="lg:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading || isLoadingNearest ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Coffee className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                <p className="text-sm">Đang tải danh sách cửa hàng...</p>
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-20 border border-slate-800/80 rounded-3xl bg-slate-900/20">
                <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">Không tìm thấy chi nhánh nào</p>
                <p className="text-slate-600 text-xs mt-1">Vui lòng thử từ khóa khác</p>
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const open = isBranchOpen(branch.openingHours);
                return (
                  <div
                    key={branch.id}
                    className="p-5 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur-sm transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    {branch.isFlagship && (
                      <div className="absolute top-0 right-0 bg-amber-500/10 border-l border-b border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                        Flagship
                      </div>
                    )}
                    <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-base flex items-center gap-2">
                      {branch.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{branch.phone || 'Liên hệ chi nhánh'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {branch.openingHours
                            ? `${branch.openingHours.open} - ${branch.openingHours.close}`
                            : 'Cả ngày'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          open
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {open ? 'Đang mở cửa' : 'Đóng cửa'}
                      </span>

                      {branch.distanceKm !== undefined && (
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                          Cách bạn {branch.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Simulated Map */}
          <div className="lg:col-span-7 h-[500px] border border-slate-800/80 rounded-3xl bg-slate-900/20 backdrop-blur-sm relative overflow-hidden flex flex-col justify-end p-6 group">
            {/* Visual Grid representing streets / grid space */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0), radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
              }}
            />

            {/* Interactive styled nodes representing current coordinates on a dynamic stylized mockup map */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central user node if active */}
              {userCoords && (
                <div className="absolute animate-pulse flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <Navigation className="w-4 h-4 text-indigo-400 rotate-45" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-300 mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-indigo-500/30 backdrop-blur-sm">
                    Vị trí của bạn
                  </span>
                </div>
              )}

              {/* HCMC branches mock offsets */}
              <div className="absolute top-[40%] left-[30%] flex flex-col items-center group/marker hover:scale-105 transition-all">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center shadow-lg animate-bounce">
                  <Coffee className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-[9px] font-semibold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm">
                  Express Cafe Q.1
                </span>
              </div>

              <div className="absolute top-[32%] left-[65%] flex flex-col items-center hover:scale-105 transition-all">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shadow-lg">
                  <Coffee className="w-3 h-3 text-indigo-400" />
                </div>
                <span className="text-[9px] font-semibold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm">
                  Express Cafe Landmark 81
                </span>
              </div>

              {/* Hanoi branch mock offset */}
              <div className="absolute top-[15%] left-[50%] flex flex-col items-center hover:scale-105 transition-all">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center shadow-lg">
                  <Coffee className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-[9px] font-semibold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm">
                  Express Cafe Hoàn Kiếm
                </span>
              </div>

              {/* Da Nang branch mock offset */}
              <div className="absolute top-[65%] left-[55%] flex flex-col items-center hover:scale-105 transition-all">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center shadow-lg">
                  <Coffee className="w-3 h-3 text-indigo-400" />
                </div>
                <span className="text-[9px] font-semibold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-sm">
                  Express Cafe Bạch Đằng
                </span>
              </div>
            </div>

            {/* Map metadata display overlays */}
            <div className="z-10 bg-slate-950/90 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md max-w-sm shadow-xl">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>Express Cafe GPS Engine</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Tích hợp công nghệ định vị GPS Haversine tối ưu hóa khoảng cách đơn hàng, tự động ghép chi nhánh hoàn tất đơn gần bạn nhất trong bán kính 50km.
              </p>
              {userCoords && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-indigo-400">
                  <span>LAT: {userCoords.lat.toFixed(4)}</span>
                  <span>LNG: {userCoords.lng.toFixed(4)}</span>
                  <span>STATUS: READY</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
