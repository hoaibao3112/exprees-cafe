'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Image as ImageIcon, ArrowRight,
  TrendingUp, Clock, Eye, CheckCircle2, ChevronRight,
  Coffee, Mail, X, MessageSquare, MapPin
} from 'lucide-react';
import { adminDashboardApi, adminContactsApi } from '@/lib/admin-api';
import { StatCardSkeleton, Skeleton } from '@/components/admin/Skeleton';
import type { DashboardStats } from '@/types/admin.types';
import { resolveUploadUrl } from '@/lib/api';


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
  const qc = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminDashboardApi.getStats() as Promise<DashboardStats>,
    staleTime: 30_000,
  });

  const servicesToShow = data?.recentServices || [];
  const contactsToShow = data?.recentContacts || [];

  const viewContactMutation = useMutation({
    mutationFn: (id: string) => adminContactsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const handleViewContact = (contact: any) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      viewContactMutation.mutate(contact.id);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              label="TỔNG DỊCH VỤ" 
              value={data?.totalServices ?? 0} 
              icon={Coffee} 
              color="bg-orange-600/10 text-orange-600" 
              href="/admin/services" 
              trend={{ text: 'Hoạt động', isNew: true }}
              sparkline={SPARKLINES.upStrong}
            />
            <StatCard 
              label="BANNER HOẠT ĐỘNG" 
              value={data?.activeBanners ?? 0} 
              icon={ImageIcon} 
              color="bg-purple-600/10 text-purple-600" 
              href="/admin/banners" 
              trend={{ text: 'Đang chạy', isNew: true }}
              sparkline={SPARKLINES.downMild}
            />
            <StatCard 
              label="CHI NHÁNH CỬA HÀNG" 
              value={data?.totalBranches ?? 0} 
              icon={MapPin} 
              color="bg-blue-600/10 text-blue-600" 
              href="/admin/settings" 
              trend={{ text: 'Bản đồ', isNew: true }}
              sparkline={SPARKLINES.waveBlue}
            />
            <StatCard 
              label="LIÊN HỆ MỚI" 
              value={data?.unreadContacts ?? 0} 
              icon={Mail} 
              color="bg-rose-600/10 text-rose-600" 
              href="#" 
              trend={{ text: data?.unreadContacts ? 'Cần xử lý' : 'Hoàn thành', isUp: (data?.unreadContacts ?? 0) > 0 }}
              sparkline={SPARKLINES.upMild}
            />
          </>
        )}
      </div>

      {/* Grid columns below: Articles & Contacts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Services Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-slate-800 font-bold text-base">Dịch vụ mới nhất</h3>
              </div>
              <Link href="/admin/services" className="text-blue-600 text-xs font-bold hover:text-blue-700 flex items-center gap-1 transition-colors">
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
              ) : servicesToShow.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                  Chưa có dịch vụ nào
                </div>
              ) : servicesToShow.map((service: any) => (
                <div
                  key={service.id}
                  className="flex items-center gap-4 px-6 py-[11px] hover:bg-slate-50/50 transition-colors group"
                >
                  {service.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveUploadUrl(service.imageUrl)}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-slate-700 text-sm font-bold flex-1 truncate group-hover:text-slate-900 transition-colors">
                    {service.name}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    service.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                  }`}>
                    {service.status === 'ACTIVE' ? 'Hoạt động' : 'Nháp'}
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
                <Mail className="w-5 h-5 text-rose-500" />
                <h3 className="text-slate-800 font-bold text-base">Liên hệ mới nhất</h3>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : contactsToShow.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                  Chưa có tin nhắn liên hệ nào
                </div>
              ) : contactsToShow.map((contact: any) => (
                <div
                  key={contact.id}
                  onClick={() => handleViewContact(contact)}
                  className="flex items-center justify-between gap-4 px-6 py-[13.5px] hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 text-sm font-bold truncate">
                        {contact.name}
                      </span>
                      {!contact.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{contact.message}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 animate-scale-up space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-850 flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-500" />
                Chi tiết phản hồi
              </h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-605 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Khách hàng</label>
                <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedContact.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại</label>
                  <p className="text-slate-700 text-sm font-semibold mt-0.5">{selectedContact.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</label>
                  <p className="text-slate-700 text-sm font-semibold mt-0.5 truncate">{selectedContact.email || '—'}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nội dung tin nhắn</label>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-600 text-xs leading-relaxed max-h-48 overflow-y-auto mt-1 font-medium whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày gửi</label>
                <p className="text-slate-500 text-xs mt-0.5">
                  {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
