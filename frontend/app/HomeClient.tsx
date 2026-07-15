'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FranchiseSection } from '../components/home/FranchiseSection';
import { NewsSection } from '../components/home/NewsSection';
import { BranchSection } from '../components/home/BranchSection';
import { AboutSection } from '../components/home/AboutSection';
import { StatsSection } from '../components/home/StatsSection';

// Dynamically import heavy and client-only components to optimize initial bundle size and FCP
const VideoSection = dynamic(
  () => import('../components/home/VideoSection').then((mod) => mod.VideoSection),
  { ssr: false }
);

const PromoPopup = dynamic(
  () => import('../components/home/PromoPopup').then((mod) => mod.PromoPopup),
  { ssr: false }
);

export default function HomeClient() {
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

      {/* Video Section (Loaded Dynamically) */}
      <VideoSection />

      {/* Chi Nhánh Section */}
      <BranchSection />

      {/* Giới Thiệu Section */}
      <AboutSection />

      {/* Light Statistics & Story Footer */}
      <StatsSection />

      {/* Main Footer (Bottom copyright) */}
      <Footer />

      {/* Promotional Pop-up Modal (Loaded Dynamically) */}
      <PromoPopup />
    </div>
  );
}
