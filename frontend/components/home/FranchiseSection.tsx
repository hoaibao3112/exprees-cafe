'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useFranchisePackagesQuery } from '@/hooks/useFranchiseQueries';
import { resolveUploadUrl } from '@/lib/api';
import { fadeUp, bounceIn, staggerContainer, springHover, springTap } from '@/lib/motion';

const MODEL_DETAILS: Record<string, { image: string; tag: string; title: string }> = {
  'EXPRESS': {
    image: '/media__1780386795847.png',
    tag: 'MÔ HÌNH QUÁN TINH GỌN',
    title: 'MÔ HÌNH QUÁN TINH GỌN'
  },
  'KIOSK': {
    image: '/media__1780386795859.png',
    tag: 'MÔ HÌNH XE TAKE AWAY LINH ĐỘNG',
    title: 'MÔ HÌNH XE TAKE AWAY LINH ĐỘNG'
  },
  'PREMIUM': {
    image: '/media__1780386795867.png',
    tag: 'MÔ HÌNH KIOSK TIỆN LỢI',
    title: 'MÔ HÌNH KIOSK TIỆN LỢI'
  }
};

export function FranchiseSection() {
  const { data: packages, isLoading } = useFranchisePackagesQuery();

  return (
    <section id="franchise" className="py-24 bg-gradient-to-br from-orange-50/40 via-white to-orange-100/10 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-[-15%] w-[45vw] h-[45vw] rounded-full bg-orange-100/30 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-100/20 blur-[100px] pointer-events-none animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-title-wrapper mb-16 text-center" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-2 rounded-full border border-[#f07b22]/20">
            Hợp Tác Đầu Tư
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase mt-4">
            NHƯỢNG QUYỀN <span className="gradient-text">0 ĐỒNG</span>
          </h2>
          <div className="section-underline mt-3 mx-auto" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm h-[400px]">
                <div className="skeleton w-full h-56" />
                <div className="p-6 space-y-4">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-10 w-36 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !packages || packages.length === 0 ? (
          <motion.div
            className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white/80 backdrop-blur-md rounded-3xl max-w-lg mx-auto shadow-sm"
            variants={bounceIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
            <h3 className="font-bold text-lg text-zinc-800">Chưa có dữ liệu gói nhượng quyền</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">Hệ thống đang đồng bộ dữ liệu. Quý đối tác vui lòng quay lại sau hoặc liên hệ Hotline để nhận tư vấn trực tiếp.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md">
              Liên hệ tư vấn
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer(0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {packages.map((pkg) => {
              const details = {
                image: resolveUploadUrl((pkg.images && pkg.images.length > 0) ? pkg.images[0] : (MODEL_DETAILS[pkg.modelType]?.image || '/media__1780386795847.png')),
                tag: MODEL_DETAILS[pkg.modelType]?.tag || 'MÔ HÌNH NHƯỢNG QUYỀN',
                title: pkg.name,
              };

              return (
                <motion.div
                  key={pkg.id}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: springHover }}
                  className="group bg-white/90 backdrop-blur-md rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 hover:bg-white hover:shadow-2xl hover:shadow-orange-500/15 transition-[border-color,background-color,box-shadow] duration-500 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                      <Image
                        src={details.image}
                        alt={details.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-65 pointer-events-none" />

                      {/* Model Category Badge */}
                      <motion.div
                        className="absolute top-4 left-4 z-10"
                        initial={{ opacity: 0, scale: 0, rotate: -45 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, ...springHover }}
                      >
                        <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg ${
                          pkg.modelType === 'PREMIUM'
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : pkg.modelType === 'KIOSK'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        }`}>
                          {pkg.modelType || 'EXPRESS'}
                        </span>
                      </motion.div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-2">
                      <span className="text-[10px] font-extrabold text-orange-500 tracking-wider uppercase block">
                        {details.tag}
                      </span>
                      <h3 className="font-bold text-base md:text-lg text-zinc-900 tracking-wide uppercase line-clamp-2 group-hover:text-orange-500 transition-colors duration-300">
                        {details.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="px-6 pb-8 pt-0 flex">
                    <motion.div className="w-full sm:w-[160px]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95, transition: springTap }}>
                      <Link
                        href={`/franchise/${pkg.id}`}
                        className="inline-flex items-center justify-between w-full px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-colors duration-300 shadow-lg shadow-orange-500/10"
                      >
                        <span>XEM THÊM</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
