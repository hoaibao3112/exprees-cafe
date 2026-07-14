'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: 'tam-nhin',
    title: 'Tầm nhìn',
    content: 'Trở thành chuỗi cà phê nhượng quyền công nghệ hàng đầu Việt Nam, mang sản phẩm cà phê hữu cơ sạch tinh khiết phục vụ hàng triệu người tiêu dùng năng động.'
  },
  {
    id: 'su-menh',
    title: 'Sứ mệnh',
    content: 'Đem lại giá trị khởi nghiệp nhượng quyền thịnh vượng với rủi ro thấp nhất cho đối tác, đồng thời đảm bảo chất lượng cà phê đồng đều và vượt trội cho khách hàng.'
  },
  {
    id: 'hoat-dong',
    title: 'Cho thuê máy/Hoạt động',
    content: 'Cung cấp giải pháp cho thuê máy pha cà phê chuyên nghiệp trọn gói cho văn phòng, khách sạn và quán kinh doanh với chi phí cực kỳ tiết kiệm chỉ từ 1 ly cà phê/ngày.'
  },
  {
    id: 'y-nghia-thuong-hieu',
    title: 'Ý nghĩa thương hiệu Express Cafe',
    content: '“Express” mang ý nghĩa tốc độ, tinh gọn và đột phá công nghệ. “Cafe” là hương vị nguyên bản truyền thống Việt Nam. Sự kết hợp thể hiện mục tiêu đổi mới sáng tạo không ngừng nghỉ.'
  },
  {
    id: 'gia-tri-cot-loi',
    title: 'Giá trị cốt lõi',
    content: 'Nguyên liệu sạch 100% - Vận hành tối giản - Công nghệ dẫn đầu (POS/GPS/CMS) - Đồng hành chia sẻ lợi ích bền vững cùng nhà đầu tư.'
  }
];

export function AboutSection() {
  const [activeAccordion, setActiveAccordion] = useState<string>('tam-nhin');

  return (
    <section id="about" className="py-24 bg-zinc-50 border-t border-b border-zinc-100 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute bottom-1/4 right-[-10%] w-[25vw] h-[25vw] rounded-full bg-orange-100/20 blur-[80px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-title-wrapper mb-16 text-center lg:text-left" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-2 rounded-full border border-[#f07b22]/20">
            Về Chúng Tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-wider mt-4 uppercase">
            GIỚI THIỆU <span className="gradient-text">EXPRESS CAFE</span>
          </h2>
          <div className="section-underline mt-3 lg:mx-0 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left side Image */}
          <div className="lg:col-span-5 relative" data-animate="fade-right" data-delay="100">
            <div className="absolute inset-0 bg-orange-500 rounded-3xl translate-x-3.5 translate-y-3.5 z-0 opacity-80" />
            <div className="relative z-10 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-zinc-200">
              <Image
                src="/h-about_banner.jpg"
                alt="Express Cafe Team"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right side Accordion */}
          <div className="lg:col-span-7 space-y-4.5" data-animate="fade-left" data-delay="200">
            {ACCORDION_ITEMS.map((item) => {
              const isOpen = activeAccordion === item.id;
              return (
                <div
                  key={item.id}
                  className={`border rounded-2xl transition-all duration-300 ${isOpen
                    ? 'border-orange-500/40 bg-white shadow-lg shadow-orange-500/[0.04]'
                    : 'border-zinc-200/80 bg-white/70 hover:bg-white hover:border-zinc-300'
                    }`}
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? '' : item.id)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={`font-extrabold text-sm md:text-base transition-colors tracking-wide ${isOpen ? 'text-orange-500' : 'text-zinc-800'
                      }`}>
                      {item.title}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-orange-500 transition-transform duration-300 rotate-180" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400 transition-transform duration-300" />
                    )}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-zinc-650 leading-relaxed border-t border-zinc-50 font-light">
                      {item.content}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                XEM THÊM <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
