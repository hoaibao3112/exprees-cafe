'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Coffee } from 'lucide-react';
import { fadeUp, staggerContainer, EASE_PREMIUM } from '@/lib/motion';

const NAV_ITEMS = [
  { label: 'GIỚI THIỆU', href: '/about', slug: 'about' },
  { label: 'NHƯỢNG QUYỀN', href: '/franchise', slug: 'franchise' },
  { label: 'CHI NHÁNH', href: '/branches', slug: 'branches' },
  { label: 'DỊCH VỤ', href: '/services', slug: 'services' },
  { label: 'MENU', href: '/promotions', slug: 'promotions' },
  { label: 'TIN TỨC', href: '/blog', slug: 'blog' },
  { label: 'LIÊN HỆ', href: '/contact', slug: 'contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-zinc-800 hover:bg-zinc-50 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {isOpen ? <X className="w-6 h-6 text-orange-500" /> : <Menu className="w-6 h-6" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="xl:hidden fixed inset-0 top-[65px] z-40 bg-zinc-950/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-4/5 max-w-xs bg-gradient-to-b from-white to-orange-50/20 h-full shadow-2xl p-6 flex flex-col justify-between"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Coffee className="w-6 h-6 text-orange-500 animate-pulse" />
                  <span className="font-heading italic text-2xl text-zinc-900">EXPRESS CAFE</span>
                </div>

                <motion.nav
                  className="flex flex-col gap-3.5 text-xs font-semibold tracking-[0.08em] uppercase text-zinc-800 font-body"
                  variants={staggerContainer(0.06, 0.1)}
                  initial="hidden"
                  animate="show"
                >
                  {NAV_ITEMS.map((item, idx) => {
                    const active = isLinkActive(item);
                    return (
                      <motion.div key={idx} variants={fadeUp}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block py-2 px-3 rounded-xl transition-colors duration-300 ${
                            active
                              ? 'bg-orange-500 text-white font-extrabold shadow-sm shadow-orange-500/10'
                              : 'hover:bg-orange-50 hover:text-orange-500'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>

              <motion.div
                className="flex flex-col gap-4 border-t border-zinc-100 pt-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE_PREMIUM }}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="w-full block py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs tracking-widest text-center rounded-xl shadow-md transition-colors uppercase"
                  >
                    Đăng ký tư vấn
                  </Link>
                </motion.div>
                <div className="text-center text-[10px] font-semibold text-zinc-400">
                  © {new Date().getFullYear()} Express Cafe. All rights reserved.
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
