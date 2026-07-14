'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBannersQuery } from '../../hooks/useContentQueries';
import { resolveUploadUrl } from '../../lib/api';

export function PromoPopup() {
  const { data: banners = [] } = useBannersQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [popupBanner, setPopupBanner] = useState<any | null>(null);

  useEffect(() => {
    // Find first active popup position banner
    const activePopup = banners.find(
      (b) => b.position === 'POPUP' && b.isActive
    );

    if (activePopup) {
      // Check session storage so it displays once per tab session
      const shownKey = `express_cafe_popup_shown_${activePopup.id}`;
      const isAlreadyShown = sessionStorage.getItem(shownKey);
      
      // Bỏ qua check SessionStorage nếu đang chạy local để test load trang hiện lại dễ dàng
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      if (!isAlreadyShown || isLocalhost) {
        setPopupBanner(activePopup);
        // Slightly delay popup display by 1.2 seconds for layout transition
        const timer = setTimeout(() => {
          setIsOpen(true);
          if (!isLocalhost) {
            sessionStorage.setItem(shownKey, 'true');
          }
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [banners]);

  if (!isOpen || !popupBanner) return null;

  const handleImageClick = () => {
    if (popupBanner.linkUrl) {
      window.location.href = popupBanner.linkUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative max-w-[90vw] sm:max-w-[400px] w-full flex flex-col items-center animate-scale-up">
        {/* Close Button overlay */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 z-20 p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all cursor-pointer shadow-lg border border-white/20"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner image click to redirect */}
        <div 
          onClick={handleImageClick}
          className={`relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/10 ${
            popupBanner.linkUrl ? 'cursor-pointer' : ''
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveUploadUrl(popupBanner.imageUrl)}
            alt={popupBanner.title || 'Quảng cáo'}
            className="w-full h-auto max-h-[75vh] object-cover hover:scale-[1.01] transition-transform duration-500 rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
}
