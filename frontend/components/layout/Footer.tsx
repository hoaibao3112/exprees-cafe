'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="w-full bg-white font-reading font-light text-sm text-zinc-700">
      
      {/* 1. Newsletter & Hotline Top Bar */}
      <div className="w-full bg-zinc-50 border-t border-b border-zinc-150 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Newsletter Label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-body font-semibold text-xs tracking-widest uppercase text-zinc-900">
                Đăng ký nhận tin
              </h4>
              <p className="font-reading font-light text-sm text-zinc-500 mt-0.5">
                Nhận các ưu đãi hấp dẫn & tin tức mới nhất từ Express Cafe
              </p>
            </div>
          </div>

          {/* Center: Email Form */}
          <form 
            onSubmit={handleSubscribe} 
            className="w-full max-w-md flex items-center border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-400 focus-within:ring-offset-1 focus-within:border-orange-400 transition-all duration-200"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              required
              className="w-full px-4 py-2.5 font-reading font-light text-sm text-zinc-700 placeholder-zinc-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 active:bg-orange-700 text-white font-body font-semibold text-xs uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer select-none"
            >
              {subscribed ? 'ĐÃ ĐĂNG KÝ!' : isSubmitting ? 'ĐANG GỬI...' : 'ĐĂNG KÝ'}
            </button>
          </form>

          {/* Right: Hotline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-md">
              <Phone className="w-4 h-4 fill-current text-white animate-pulse" />
            </div>
            <div className="text-right lg:text-left">
              <span className="font-body font-semibold tracking-widest uppercase text-[10px] text-zinc-400 block">Hotline hỗ trợ</span>
              <a 
                href="tel:0362077399" 
                className="font-body font-bold text-base text-red-500 hover:text-red-600 transition-colors tracking-wide block mt-0.5"
              >
                0362 077 399
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Content Columns */}
      <div className="w-full py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: GIỚI THIỆU */}
          <div className="md:col-span-5 flex flex-col gap-6" data-animate="fade-up" data-delay="100">
            <h3 className="font-body font-semibold tracking-widest uppercase text-xs text-zinc-400 border-b-2 border-orange-500 w-fit pb-1">
              Giới thiệu
            </h3>
            <p className="font-reading font-light text-sm text-zinc-500 leading-relaxed max-w-md">
              Express Cafe với mong muốn hợp tác kinh doanh, mang đến cơ hội kinh doanh hấp dẫn với chất lượng sản phẩm vượt trội và dịch vụ chuyên nghiệp. Chúng tôi cam kết hỗ trợ đối tác tối đa để phát triển và thành công trong lĩnh vực F&B. Hãy liên hệ với chúng tôi để biết thêm nhiều thông tin chi tiết!
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center rounded-full transition-all shadow-md shadow-orange-500/10"
              >
                {/* Custom Facebook Icon */}
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 13.5h2.5l1-3H14V8.5c0-.7.2-1.2 1.2-1.2H17V4.7c-.3-.04-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H9v3h2.6V20h2.4v-6.5z" />
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center rounded-full transition-all shadow-md shadow-orange-500/10"
              >
                {/* Custom Youtube Icon */}
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.582 6.186a2.69 2.69 0 0 0-1.89-1.89C18.024 3.83 12 3.83 12 3.83s-6.024 0-7.692.466a2.69 2.69 0 0 0-1.89 1.89c-.466 1.67-.466 5.147-.466 5.147s0 3.477.466 5.148a2.69 2.69 0 0 0 1.89 1.89c1.668.466 7.692.466 7.692.466s6.024 0 7.692-.466a2.69 2.69 0 0 0 1.89-1.89c.466-1.67.466-5.148.466-5.148s0-3.478-.466-5.147zM9.545 15.568V7.102l7.386 4.233-7.386 4.233z" />
                </svg>
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center rounded-full transition-all shadow-md shadow-orange-500/10"
              >
                {/* Custom Tiktok Icon */}
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.83 2.15 1.37 3.4 1.55v4.06c-1.12-.04-2.22-.38-3.19-.99-.86-.54-1.57-1.32-2.07-2.24v6.86c0 1.25-.32 2.48-.92 3.58-.68 1.14-1.74 2.02-3 2.5-1.18.44-2.46.51-3.69.21-1.2-.29-2.31-.98-3.12-1.93-.89-1.01-1.39-2.31-1.39-3.67 0-1.42.54-2.79 1.5-3.8 1.03-1.02 2.45-1.58 3.91-1.55.67-.01 1.33.11 1.95.35v4.1c-.6-.24-1.26-.31-1.9-.2-.67.1-1.3.42-1.76.92-.48.51-.73 1.2-.7 1.9.01.73.34 1.41.9 1.86.53.4 1.19.59 1.87.53.64-.04 1.25-.33 1.68-.81.42-.51.62-1.16.59-1.82V0h-.03z" />
                </svg>
              </a>
              <a 
                href="/branches" 
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center rounded-full transition-all shadow-md shadow-orange-500/10"
              >
                <MapPin className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: VỀ CHÚNG TÔI */}
          <div className="md:col-span-3 flex flex-col gap-6" data-animate="fade-up" data-delay="200">
            <h3 className="font-body font-semibold tracking-widest uppercase text-xs text-zinc-400 border-b-2 border-orange-500 w-fit pb-1">
              Về chúng tôi
            </h3>
            <ul className="flex flex-col gap-3 font-reading font-light text-sm">
              <li>
                <Link href="/#about" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/#franchise" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Nhượng quyền
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Chi nhánh
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Menu
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Tin tức
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Blogs
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span className="text-zinc-300">—</span> Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ AIZEN WORLD */}
          <div className="md:col-span-4 flex flex-col gap-6" data-animate="fade-up" data-delay="300">
            <h3 className="font-heading font-semibold text-base text-zinc-900 uppercase border-b-2 border-orange-500 w-fit pb-1 leading-tight">
              CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ AIZEN WORLD
            </h3>
            <ul className="flex flex-col gap-3 font-reading font-light text-sm text-zinc-500">
              <li className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-zinc-300 shrink-0">—</span>
                <span>
                  <strong className="text-zinc-800 font-medium font-body">Địa chỉ:</strong> 112 Lý Phục Man, Phường Tân Thuận, Quận 7, Thành phố Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-zinc-300 shrink-0">—</span>
                <span>
                  <strong className="text-zinc-800 font-medium font-body">Điện thoại:</strong> 0362 077 399
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-zinc-300 shrink-0">—</span>
                <span>
                  <strong className="text-zinc-800 font-medium font-body">Email:</strong> info@aizenworld.com
                </span>
              </li>
            </ul>
            
            {/* Consultation CTA Button */}
            <Link 
              href="/#contact" 
              className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-body font-semibold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-600/30 active:scale-[0.98] w-fit"
            >
              Đăng ký tư vấn ngay
            </Link>
          </div>

        </div>
      </div>

      {/* 3. Bottom copyright panel */}
      <div className="w-full border-t border-zinc-100 py-6 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-reading font-light text-sm text-zinc-400">
            Copyright © 2026 Express Cafe. Powered by Haravan
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
