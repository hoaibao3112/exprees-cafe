'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Coffee } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'GIỚI THIỆU', href: '/about', slug: 'about' },
  { label: 'NHƯỢNG QUYỀN', href: '/franchise', slug: 'franchise' },
  { label: 'CHI NHÁNH', href: '/branches', slug: 'branches' },
  { label: 'DỊCH VỤ', href: '/services', slug: 'services' },
  { label: 'MENU', href: '/promotions', slug: 'promotions' },
  { label: 'TIN TỨC', href: '/blog', slug: 'blog' },
  { label: 'BLOGS', href: '/blog', slug: 'blogs' },
  { label: 'LIÊN HỆ', href: '/contact', slug: 'contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Explicit scroll event listener for micro-interactions class addition
    const explicitScrollListener = () => {
      const headerNav = document.querySelector('header');
      if (window.scrollY > 80) {
        headerNav?.classList.add('navbar-scrolled');
      } else {
        headerNav?.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', explicitScrollListener);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', explicitScrollListener);
    };
  }, []);

  // Determine if a menu link is currently active based on path
  const isLinkActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.href === '/') {
      return pathname === '/';
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <header 
      className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
        scrolled ? 'py-2 shadow-md border-zinc-100 bg-white/95 backdrop-blur-md navbar-scrolled' : 'py-4 border-zinc-200 bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform duration-300 active:scale-95">
          <div className="relative w-[150px] h-[45px] sm:w-[170px] sm:h-[50px]">
            <Image
              src="/logo.png?v=3"
              alt="Express Cafe Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Center/Right Side: Navigation Menu for Desktop */}
        <nav className="hidden xl:flex items-center gap-7 text-sm font-medium tracking-[0.08em] uppercase text-zinc-900 font-body">
          {NAV_ITEMS.map((item, idx) => {
            const active = isLinkActive(item);
            
            return (
              <Link 
                key={idx} 
                href={item.href}
                className={`transition-all duration-300 hover:text-orange-500 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full ${
                  active 
                    ? 'text-orange-500 font-bold after:w-full' 
                    : 'text-zinc-800 after:w-0'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Vertical Separator exactly matching user mockup */}
          <span className="h-6 w-[1px] bg-zinc-200 ml-2" />
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex xl:hidden items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-zinc-800 hover:bg-zinc-50 active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6 text-orange-500" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 top-[65px] z-40 bg-zinc-950/20 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <Coffee className="w-6 h-6 text-orange-500" />
                <span className="font-heading italic text-2xl text-zinc-900">EXPRESS CAFE</span>
              </div>
              
              <nav className="flex flex-col gap-4 text-sm font-medium tracking-[0.08em] uppercase text-zinc-800 font-body">
                {NAV_ITEMS.map((item, idx) => {
                  const active = isLinkActive(item);
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`py-2 px-3 rounded-lg transition-all duration-300 ${
                        active 
                          ? 'bg-orange-50 text-orange-500 font-bold' 
                          : 'hover:bg-zinc-50 hover:text-orange-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="border-t pt-4 text-center text-xs font-semibold text-zinc-400">
              © {new Date().getFullYear()} Express Cafe. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
