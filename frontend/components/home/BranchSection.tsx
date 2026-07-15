'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useBranchesQuery } from '@/hooks/useBranchQueries';
import { resolveUploadUrl } from '@/lib/api';
import { fadeUp, staggerContainer, springHover } from '@/lib/motion';

export function BranchSection() {
  const { data: branches, isLoading: isLoadingBranches } = useBranchesQuery();

  return (
    <section id="branches" className="py-24 bg-white relative overflow-hidden border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="section-title-wrapper mb-16 text-center" data-animate="fade-up">
          <span className="text-xs font-black uppercase tracking-widest text-[#f07b22] bg-[#f07b22]/10 px-4 py-2 rounded-full border border-[#f07b22]/20">
            Hệ Thống Cửa Hàng
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-wider uppercase mt-4">
            HỆ THỐNG <span className="gradient-text">CHI NHÁNH</span>
          </h2>
          <div className="section-underline mt-3 mx-auto" />
        </div>

        {isLoadingBranches ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 overflow-hidden shadow-sm h-[220px] p-4 flex flex-col gap-4">
                <div className="skeleton w-full h-32 rounded-2xl" />
                <div className="skeleton h-5 w-2/3 mx-auto mt-2" />
              </div>
            ))}
          </div>
        ) : !branches || branches.length === 0 ? (
          <div className="text-center py-16 p-8 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-md mx-auto shadow-sm">
            <MapPin className="w-12 h-12 text-orange-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-zinc-700">Chưa có chi nhánh hoạt động</h3>
            <p className="text-sm text-zinc-400 mt-1">Hệ thống cửa hàng trên toàn quốc đang chuẩn bị khai trương.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {branches.slice(0, 4).map((branch) => (
              <motion.div key={branch.id} variants={fadeUp} whileHover={{ y: -8, transition: springHover }}>
                <Link
                  href={`/branches?id=${branch.id}`}
                  className="group rounded-3xl border border-zinc-200/80 overflow-hidden hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-[border-color,box-shadow] duration-500 flex flex-col bg-white cursor-pointer"
                >
                  {/* Storefront Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={resolveUploadUrl(branch.imageUrl || '/slideshow_3.jpg')}
                      alt={branch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Branch name footer strip with premium gradient */}
                  <div className="p-4 bg-gradient-to-r from-[#f07b22] to-orange-600 text-white text-center shadow-inner">
                    <h3 className="font-extrabold text-xs sm:text-[13px] text-white tracking-wider uppercase line-clamp-2">
                      EXPRESS CAFE - {branch.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
