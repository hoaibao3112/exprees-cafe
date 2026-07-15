'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Image as ImageIcon,
  Settings, LogOut, Coffee, ChevronLeft, ChevronRight,
  Menu, X, Search, Bell, Play, Award
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ToastContainer } from '@/components/admin/Toast';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/services', label: 'Dịch vụ', icon: Coffee },
  { href: '/admin/banners', label: 'Banner', icon: ImageIcon },
  { href: '/admin/videos', label: 'Video', icon: Play },
  { href: '/admin/franchise', label: 'Nhượng quyền', icon: Award },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nếu là trang đăng nhập thì chỉ hiển thị nội dung trang đăng nhập, không kèm Sidebar/Header
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen w-full">
        {children}
        <ToastContainer />
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };


  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Brand Logo & Title */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-slate-200/80 ${collapsed ? 'justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500 shadow-sm border border-orange-500/10">
            <Coffee className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative w-36 h-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png?v=3"
                alt="Express Cafe Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-slate-400 text-[9px] font-extrabold tracking-wider uppercase border-l border-slate-200 pl-2">
              ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative
                ${active
                  ? 'bg-blue-600/10 text-[#0047cc] shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'}
              `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0047cc] rounded-r-md" />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-[#0047cc]' : 'text-slate-400'}`} />
              {!collapsed && (
                <span className="flex-1 truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile & Logout */}
      <div className="border-t border-slate-200/80 p-4 space-y-2">
        {mounted && !collapsed && user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/60 border border-slate-200/40">
            <div className="w-9 h-9 rounded-full bg-blue-600/10 text-[#0047cc] flex items-center justify-center text-sm font-bold uppercase shrink-0">
              {(user.name ?? user.email).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm font-bold truncate leading-none">{user.name}</p>
              <p className="text-slate-400 text-xs truncate mt-1">
                {user.role === 'super_admin' ? 'Quản trị viên cấp cao' : 'Quản trị viên'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all w-full"
        >
          <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-600" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f5f9] text-slate-800 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed left-0 top-0 h-full z-40
          bg-[#f8fafc] border-r border-slate-200/60 transition-all duration-300
          ${collapsed ? 'w-18' : 'w-64'}
        `}
      >
        <SidebarContent />
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all z-50 shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`
          fixed left-0 top-0 h-full w-64 z-50 lg:hidden
          bg-[#f8fafc] border-r border-slate-200/60 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content body */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-18' : 'lg:ml-64'}`}>
        {/* Main Navbar Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Input field */}
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, dịch vụ..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {/* User Profile Info card */}
            {mounted && user && (
              <div className="flex items-center gap-3 border-l border-slate-200/80 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-slate-800 text-sm font-bold leading-none">{user.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold tracking-wide uppercase mt-1">
                    {user.role === 'super_admin' ? 'QUẢN TRỊ TỐI CAO' : 'QUẢN TRỊ VIÊN'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 text-[#0047cc] flex items-center justify-center text-sm font-bold uppercase shadow-sm shadow-blue-500/5">
                  {(user.name ?? user.email).charAt(0)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content render area */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
