'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  FileText, MapPin, Image as ImageIcon, Mail, ArrowRight,
  TrendingUp, Clock, Eye, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react';
import { adminDashboardApi } from '@/lib/admin-api';
import { StatCardSkeleton, Skeleton } from '@/components/admin/Skeleton';
import type { DashboardStats } from '@/types/admin.types';

const BADGE_HANDLE: Record<string, string> = {
  news: 'Tin tức',
  blog: 'Blog',
  services: 'Dịch vụ',
  techniques: 'Kỹ thuật',
  marketing: 'Tiếp thị',
  sustainability: 'Bền vững',
  education: 'Đào tạo'
};

const BADGE_COLOR: Record<string, string> = {
  news: 'bg-blue-50 text-blue-600 border border-blue-100',
  blog: 'bg-purple-50 text-purple-600 border border-purple-100',
  services: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  techniques: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  marketing: 'bg-amber-50 text-amber-600 border border-amber-100',
  sustainability: 'bg-teal-50 text-teal-600 border border-teal-100',
  education: 'bg-rose-50 text-rose-600 border border-rose-100'
};

// SVG sparklines for gorgeous visual trends
const SPARKLINES = {
  upStrong: (
    <svg className="w-24 h-10 overflow-visible text-emerald-500" viewBox="0 0 100 30" fill="none">
      <path d="M0,25 C15,22 25,10 40,12 C55,14 70,5 100,2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0,25 C15,22 25,10 40,12 C55,14 70,5 100,2 L100,30 L0,30 Z" fill="url(#gradUp)" opacity="0.06" />
      <defs>
        <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  ),
  upMild: (
    <svg className="w-24 h-10 overflow-visible text-emerald-400" viewBox="0 0 100 30" fill="none">
      <path d="M0,22 C15,22 30,15 45,18 C60,21 75,10 100,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0,22 C15,22 30,15 45,18 C60,21 75,10 100,8 L100,30 L0,30 Z" fill="url(#gradUpMild)" opacity="0.05" />
      <defs>
        <linearGradient id="gradUpMild" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  ),
  downMild: (
    <svg className="w-24 h-10 overflow-visible text-rose-400" viewBox="0 0 100 30" fill="none">
      <path d="M0,5 C20,4 35,18 50,15 C65,12 80,24 100,22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0,5 C20,4 35,18 50,15 C65,12 80,24 100,22 L100,30 L0,30 Z" fill="url(#gradDown)" opacity="0.05" />
      <defs>
        <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  ),
  waveBlue: (
    <svg className="w-24 h-10 overflow-visible text-blue-500" viewBox="0 0 100 30" fill="none">
      <path d="M0,20 C15,10 25,25 45,15 C65,5 75,20 100,10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0,20 C15,10 25,25 45,15 C65,5 75,20 100,10 L100,30 L0,30 Z" fill="url(#gradWave)" opacity="0.05" />
      <defs>
        <linearGradient id="gradWave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

function StatCard({
  label, value, icon: Icon, color, href, trend, sparkline,
}: {
  label: string;
  value: number | string | undefined;
  icon: React.ElementType;
  color: string;
  href: string;
  trend?: { text: string; isUp?: boolean; isNew?: boolean };
  sparkline: React.ReactNode;
}) {
  return (
    <Link href={href} className="group block">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/[0.03] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              {value ?? '—'}
            </div>
            {trend && (
              <span className={`inline-flex items-center text-xs font-bold ${
                trend.isNew 
                  ? 'bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100'
                  : trend.isUp 
                    ? 'text-emerald-600' 
                    : 'text-rose-600'
              }`}>
                {trend.isUp && <span className="mr-0.5">↑</span>}
                {!trend.isUp && !trend.isNew && <span className="mr-0.5">↓</span>}
                {trend.text}
              </span>
            )}
          </div>
          
          <div className="shrink-0 pl-4">
            {sparkline}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminDashboardApi.getStats() as Promise<DashboardStats>,
    staleTime: 30_000,
  });

  // Mock static data aligned with exact screenshot specs to present a high-fidelity look
  const recentArticlesMock = [
    { id: '1', title: 'Kỹ thuật rang Espresso hoàn hảo độc quyền', blogHandle: 'techniques', status: 'PUBLISHED', createdAt: '2026-05-24T11:00:00Z', author: 'Jane Doe' },
    { id: '2', title: 'Khai trương chi nhánh mới: Riverside Bến Vân Đồn', blogHandle: 'news', status: 'PUBLISHED', createdAt: '2026-05-23T09:15:00Z', author: 'Marcus Ross' },
    { id: '3', title: 'Nháp thực đơn thức uống mùa đông mới 2026', blogHandle: 'marketing', status: 'DRAFT', createdAt: '2026-05-22T08:00:00Z', author: 'Sarah Lee' },
    { id: '4', title: 'Chiến dịch chuyển đổi sử dụng bao bì tái chế', blogHandle: 'sustainability', status: 'PUBLISHED', createdAt: '2026-05-20T10:00:00Z', author: 'Jane Doe' },
    { id: '5', title: 'Chương trình đào tạo chuẩn Barista chuyên nghiệp', blogHandle: 'education', status: 'DRAFT', createdAt: '2026-05-18T14:00:00Z', author: 'Sarah Lee' },
  ];

  const recentContactsMock = [
    { id: '1', name: 'Sarah Jenkins', time: '2 phút trước', subject: 'Yêu cầu nhượng quyền - Hà Nội', message: 'Tôi có mặt bằng kinh doanh tại trung tâm quận Hoàn Kiếm, rất mong muốn được tìm hiểu...', avatarText: 'SJ' },
    { id: '2', name: 'Michael Chen', time: '45 phút trước', subject: 'Yêu cầu sự kiện doanh nghiệp', message: 'Chúng tôi muốn đặt tiệc trà/cà phê cho buổi hội nghị công nghệ khoảng 200 khách...', avatarText: 'MC' },
    { id: '3', name: 'Emma Thompson', time: '3 giờ trước', subject: 'Góp ý về chất lượng dịch vụ', message: 'Không gian quán tại Bến Vân Đồn rất đẹp và nhân viên cực kỳ thân thiện, tôi đã có...', avatarText: 'ET' },
    { id: '4', name: 'David Wilson', time: 'Hôm qua', subject: 'Hợp tác cung cấp hạt cà phê', message: 'Đại diện hợp tác xã cà phê Arabica Cầu Đất, chúng tôi xin cung cấp mẫu thử nguyên chất...', avatarText: 'DW' },
  ];

  const articlesToShow = data?.recentArticles?.length ? data.recentArticles : recentArticlesMock;
  const contactsToShow = data?.recentContacts?.length ? data.recentContacts : [];

  return (
    <div className="space-y-8">
      {/* Title Greeting section */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-bold text-blue-600">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          MÁY CHỦ SẴN SÀNG
        </div>
      </div>

      {/* Stat Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              label="TỔNG BÀI VIẾT" 
              value={data?.totalArticles ?? '1,284'} 
              icon={FileText} 
              color="bg-blue-600/10 text-[#0047cc]" 
              href="/admin/articles" 
              trend={{ text: '+12%', isUp: true }}
              sparkline={SPARKLINES.upStrong}
            />
            <StatCard 
              label="TỔNG CHI NHÁNH" 
              value={data?.totalBranches ?? '42'} 
              icon={MapPin} 
              color="bg-emerald-600/10 text-emerald-600" 
              href="/admin/branches" 
              trend={{ text: '+4%', isUp: true }}
              sparkline={SPARKLINES.upMild}
            />
            <StatCard 
              label="BANNER HOẠT ĐỘNG" 
              value={data?.activeBanners ?? '18'} 
              icon={ImageIcon} 
              color="bg-purple-600/10 text-purple-600" 
              href="/admin/banners" 
              trend={{ text: '-2%', isUp: false }}
              sparkline={SPARKLINES.downMild}
            />
            <StatCard 
              label="LIÊN HỆ MỚI" 
              value={data?.unreadContacts ?? '156'} 
              icon={Mail} 
              color="bg-blue-600/10 text-[#0047cc]" 
              href="/admin/contacts" 
              trend={{ text: 'NEW', isNew: true }}
              sparkline={SPARKLINES.waveBlue}
            />
          </>
        )}
      </div>

      {/* Two columns: Recent Articles vs Recent Contacts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Articles Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-slate-800 font-bold text-base">Bài viết mới nhất</h3>
              </div>
              <Link href="/admin/articles" className="text-blue-600 text-xs font-bold hover:text-blue-700 flex items-center gap-1 transition-colors">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : articlesToShow.map((article: any) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 px-6 py-[17px] hover:bg-slate-50/50 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                  <span className="text-slate-700 text-sm font-bold flex-1 truncate group-hover:text-slate-900 transition-colors">
                    {article.title}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    BADGE_COLOR[article.blogHandle] ?? 'bg-slate-100 text-slate-500'
                  }`}>
                    {BADGE_HANDLE[article.blogHandle] ?? article.blogHandle}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    article.status === 'PUBLISHED' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                  }`}>
                    {article.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Contacts Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-slate-800 font-bold text-base">Liên hệ gần đây</h3>
              </div>
              <Link href="/admin/contacts" className="text-blue-600 text-xs font-bold hover:text-blue-700 flex items-center gap-1 transition-colors">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : (contactsToShow.length ? contactsToShow : recentContactsMock).map((contact: any) => (
                <Link
                  key={contact.id}
                  href="/admin/contacts"
                  className="flex items-start gap-4 px-6 py-4.5 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="text-[#0047cc] text-xs font-bold uppercase">
                      {contact.avatarText ?? contact.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 text-sm font-bold group-hover:text-[#0047cc] transition-colors truncate">
                        {contact.name}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold">{contact.time ?? formatDate(contact.createdAt)}</span>
                    </div>
                    <p className="text-slate-700 text-xs font-bold truncate mt-1">{contact.subject ?? 'Liên hệ mới'}</p>
                    <p className="text-slate-400 text-xs truncate mt-0.5 leading-relaxed">{contact.message}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-center">
            <Link 
              href="/admin/contacts" 
              className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0047cc] text-xs font-bold hover:bg-slate-50 shadow-sm transition-all text-center w-full max-w-xs"
            >
              Đi tới Hộp thư
            </Link>
          </div>
        </div>

      </div>

      {/* System Activity Timeline section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Dòng thời gian hoạt động hệ thống
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            CẬP NHẬT TRỰC TIẾP
          </span>
        </div>

        <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-1">
          {/* Item 1 */}
          <div className="relative">
            <div className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-800">Alex Rivera</span> 
              <span className="text-slate-500"> đã cập nhật bài viết: </span>
              <a href="#" className="font-bold text-blue-600 hover:underline">"Kỹ thuật rang Espresso hoàn hảo độc quyền"</a>
            </div>
            <p className="text-slate-400 text-xs mt-1">Hôm nay lúc 11:42 AM</p>
          </div>

          {/* Item 2 */}
          <div className="relative">
            <div className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-800">Jane Smith</span> 
              <span className="text-slate-500"> đã thêm chi nhánh mới: </span>
              <span className="font-bold text-slate-700">Riverside Bến Vân Đồn</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Hôm nay lúc 09:15 AM</p>
          </div>

          {/* Item 3 */}
          <div className="relative">
            <div className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-800">Hệ thống</span> 
              <span className="text-slate-500"> đã tự động lưu trữ Banner sự kiện hết hạn </span>
              <span className="font-bold text-slate-700">#452</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Hôm qua lúc 11:59 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
