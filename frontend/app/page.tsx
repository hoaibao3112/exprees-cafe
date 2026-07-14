'use client';

import { useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FranchiseSection } from '../components/home/FranchiseSection';
import { NewsSection } from '../components/home/NewsSection';
import { VideoSection } from '../components/home/VideoSection';
import { BranchSection } from '../components/home/BranchSection';
import { AboutSection } from '../components/home/AboutSection';
import { StatsSection } from '../components/home/StatsSection';
import { PromoPopup } from '../components/home/PromoPopup';

export default function Home() {
  // Activate scroll animations
  useScrollAnimation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-800 font-sans antialiased">
      {/* Shared Navigation Header */}
      <Header />

      {/* Hero Slideshow Section */}
      <HeroSection />

      {/* Nhượng Quyền 0 Đồng Section */}
      <FranchiseSection />

      {/* Tin Tức Section */}
      <NewsSection />

      {/* Video Section */}
      <VideoSection />

      {/* Chi Nhánh Section */}
      <BranchSection />

      {/* Giới Thiệu Section */}
      <AboutSection />

      {/* Light Statistics & Story Footer */}
      <StatsSection />

      {/* Main Footer (Bottom copyright) */}
      <Footer />

      {/* Promotional Pop-up Modal */}
      <PromoPopup />
    </div>
  );
}
