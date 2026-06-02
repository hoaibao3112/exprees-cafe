'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Globe, Home, Palette, Sparkles, Coffee, Phone, Mail, Share2, ToggleLeft, ToggleRight, Layout, Trash2, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { adminSettingsApi } from '@/lib/admin-api';
import { CardSkeleton } from '@/components/admin/Skeleton';
import { toast } from '@/components/admin/Toast';
import type { SiteSettings } from '@/types/admin.types';

const defaultSettings: SiteSettings = {
  brandName: 'Express Cafe',
  slogan: 'Ủ Chậm Hoàn Hảo - Phục Vụ Siêu Tốc',
  logoUrl: '',
  faviconUrl: '',
  contactEmail: 'hello@expresscafe.com',
  contactPhone: '+1 (555) 123-4567',
  address: '69 Bến Vân Đồn, Phường 13, Quận 4, TP. Hồ Chí Minh',
  facebookUrl: 'https://facebook.com/expresscafe',
  youtubeUrl: 'https://youtube.com/expresscafe',
  tiktokUrl: 'https://tiktok.com/@expresscafe',
  
  heroEnabled: true,
  heroHeading: 'Brewed to Perfection',
  heroSubtitle: 'Experience the finest artisanal beans roasted daily in the heart of the city.',
  heroCtaText: 'Đặt Ngay',
  heroCtaLink: '/menu',
  heroBgImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
  
  bannerSlideshowEnabled: true,
  blogSectionEnabled: true,
  blogSectionTitle: 'Tin tức & Ưu đãi mới nhất',
  blogSectionCount: 3,
  branchSectionEnabled: true,
  branchSectionTitle: 'Hệ thống chi nhánh Express Cafe',
  serviceSectionEnabled: true,
  
  primaryColor: '#0047cc',
  secondaryColor: '#f1f5f9',
  darkMode: false,
};

const parseSettings = (data: any): SiteSettings => {
  if (!data || Object.keys(data).length === 0) return defaultSettings;
  const settings = { ...defaultSettings };
  Object.keys(defaultSettings).forEach((key) => {
    if (data[key] !== undefined) {
      const val = data[key];
      const typedKey = key as keyof SiteSettings;
      if (typeof defaultSettings[typedKey] === 'boolean') {
        (settings as any)[key] = val === 'true' || val === true;
      } else if (typeof defaultSettings[typedKey] === 'number') {
        (settings as any)[key] = Number(val);
      } else {
        (settings as any)[key] = String(val);
      }
    }
  });
  return settings;
};

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'HOMEPAGE' | 'APPEARANCE'>('GENERAL');
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminSettingsApi.getAll(),
  });

  useEffect(() => {
    if (data) {
      setSettings(parseSettings(data));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: SiteSettings) => {
      const rawPayload: Record<string, string | boolean | number> = {};
      Object.entries(payload).forEach(([k, v]) => {
        rawPayload[k] = v;
      });
      return adminSettingsApi.update(rawPayload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Đã lưu cấu hình cài đặt thành công!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Lỗi khi lưu cài đặt');
    },
  });

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(settings);
  };

  const handleDiscard = () => {
    if (data) {
      setSettings(parseSettings(data));
      toast.success('Đã khôi phục về cấu hình đã lưu');
    } else {
      setSettings(defaultSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cài đặt</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">Cấu hình nhận diện thương hiệu, thông tin liên hệ và hiển thị trang chủ khách hàng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Config Form (Spans 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex border border-slate-200 bg-slate-100/60 p-1.5 rounded-2xl max-w-md shadow-sm">
            <button
              onClick={() => setActiveTab('GENERAL')}
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'GENERAL'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab('HOMEPAGE')}
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HOMEPAGE'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Trang chủ
            </button>
            <button
              onClick={() => setActiveTab('APPEARANCE')}
              className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'APPEARANCE'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Giao diện
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TAB 1: GENERAL CONFIGS */}
            {activeTab === 'GENERAL' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
                
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-600" /> Thông tin chung thương hiệu
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Tên thương hiệu</label>
                      <input
                        value={settings.brandName}
                        onChange={(e) => handleChange('brandName', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Slogan thương hiệu</label>
                      <input
                        value={settings.slogan}
                        onChange={(e) => handleChange('slogan', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Logo Upload Container */}
                  <div className="space-y-2.5 mt-5">
                    <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Logo Thương Hiệu</label>
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                      
                      {/* Logo preview thumb */}
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 bg-white relative overflow-hidden shadow-inner">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Coffee className="w-8 h-8" />
                            <span className="text-[9px] mt-1 font-bold">COFFEE</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Upload actions */}
                      <div className="flex-1 w-full text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => {
                              const testLogo = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=150&auto=format&fit=crop';
                              handleChange('logoUrl', settings.logoUrl ? '' : testLogo);
                              toast.info(settings.logoUrl ? 'Đã xóa logo thử nghiệm' : 'Đã nạp logo thương hiệu thử nghiệm!');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {settings.logoUrl ? 'Thay đổi Logo' : 'Tải lên mới'}
                          </button>
                          {settings.logoUrl && (
                            <button
                              type="button"
                              onClick={() => handleChange('logoUrl', '')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa Logo
                            </button>
                          )}
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                          Định dạng PNG, JPG hoặc SVG. Dung lượng tối đa 2MB. Đề xuất tỉ lệ vuông 512×512px.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact section */}
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4 text-blue-600" /> Thông tin liên hệ
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Email hỗ trợ</label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Số điện thoại liên hệ</label>
                      <input
                        value={settings.contactPhone}
                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HOMEPAGE CONFIGURE */}
            {activeTab === 'HOMEPAGE' && (
              <div className="space-y-6">
                
                {/* Hero Banner configuration */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" /> Cấu hình khối biểu ngữ chính (Hero Section)
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleChange('heroEnabled', !settings.heroEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.heroEnabled ? (
                        <ToggleRight className="w-11 h-7 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {settings.heroEnabled && (
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Tiêu đề lớn chính (Heading)</label>
                        <input
                          value={settings.heroHeading}
                          onChange={(e) => handleChange('heroHeading', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Mô tả ngắn phụ (Subtitle)</label>
                        <textarea
                          value={settings.heroSubtitle}
                          onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-medium leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Chữ trên nút (CTA Text)</label>
                          <input
                            value={settings.heroCtaText}
                            onChange={(e) => handleChange('heroCtaText', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Đường dẫn nút bấm (CTA Link)</label>
                          <input
                            value={settings.heroCtaLink}
                            onChange={(e) => handleChange('heroCtaLink', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Đường dẫn ảnh nền Hero (Image URL)</label>
                        <input
                          value={settings.heroBgImage}
                          onChange={(e) => handleChange('heroBgImage', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: APPEARANCE CONFIGS */}
            {activeTab === 'APPEARANCE' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
                
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" /> Tùy biến màu sắc nhận diện
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
                    {/* Primary Color selection */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <label className="text-slate-700 text-xs font-bold block">Màu sắc chủ đạo (Primary Color)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer overflow-hidden outline-none shrink-0"
                        />
                        <div>
                          <span className="text-slate-800 text-sm font-mono font-bold block uppercase">{settings.primaryColor}</span>
                          <span className="text-slate-400 text-[10px] font-semibold block mt-0.5">Màu của nút bấm, nhãn trạng thái chính...</span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Color Selection */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <label className="text-slate-700 text-xs font-bold block">Màu nền phụ (Secondary Color)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => handleChange('secondaryColor', e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border border-slate-300 cursor-pointer overflow-hidden outline-none shrink-0"
                        />
                        <div>
                          <span className="text-slate-800 text-sm font-mono font-bold block uppercase">{settings.secondaryColor}</span>
                          <span className="text-slate-400 text-[10px] font-semibold block mt-0.5">Màu nền phụ, khối chi tiết mờ...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Mode toggle default */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <span className="text-slate-800 text-xs font-bold block">Kích hoạt giao diện tối mặc định (Dark Mode)</span>
                    <span className="text-slate-400 text-[10px] font-semibold block mt-0.5">Đặt cấu hình mặc định là nền tối huyền ảo cho khách hàng</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('darkMode', !settings.darkMode)}
                    className="cursor-pointer"
                  >
                    {settings.darkMode ? (
                      <ToggleRight className="w-11 h-7 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-11 h-7 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Save / Discard Actions bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 gap-3">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Hủy thay đổi
              </button>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 stroke-[3]" />
                )}
                Lưu cấu hình
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: LIVE PREVIEW Device Mockup (Spans 5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          
          <div className="flex items-center justify-between px-2">
            <span className="text-slate-500 text-xs font-extrabold uppercase tracking-widest">XEM TRƯỚC TRỰC TUYẾN</span>
            
            {/* Color preview status circles */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            </div>
          </div>

          {/* Browser / Device frame layout mockup */}
          <div className="w-full bg-[#eef2f6] border border-slate-200 rounded-3xl p-3 shadow-lg select-none">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col min-h-[580px]">
              
              {/* Mock Address Bar */}
              <div className="bg-slate-100 p-2.5 flex items-center gap-2 border-b border-slate-200/60">
                {/* Search mock */}
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-3 text-[10px] text-slate-400 text-center font-mono flex items-center justify-center gap-1">
                  <span>🔒</span>
                  <span>expresscafe.com</span>
                </div>
              </div>

              {/* simulated Web Content inside Mock */}
              <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                
                {/* Navbar inside preview */}
                <header className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-[#0047cc] flex items-center justify-center">
                        <Coffee className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="text-slate-800 font-bold text-xs tracking-tight">{settings.brandName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-4 h-0.5 bg-slate-700 block" />
                    <span className="w-4 h-0.5 bg-slate-700 block mt-1" />
                  </div>
                </header>

                {/* Hero Banner inside preview */}
                {settings.heroEnabled ? (
                  <div className="relative py-12 px-5 flex flex-col justify-center text-center overflow-hidden bg-slate-900 border-b border-slate-100 shrink-0">
                    {/* Background image mockup with dark layer */}
                    <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 transition-all duration-300"
                      style={{ backgroundImage: `url(${settings.heroBgImage})` }} />
                    <div className="absolute inset-0 bg-slate-950/40 z-0" />
                    
                    <div className="relative z-10 space-y-2 text-white">
                      <h4 className="text-lg font-black tracking-tight leading-snug">{settings.heroHeading}</h4>
                      <p className="text-[10px] opacity-90 leading-relaxed max-w-[240px] mx-auto line-clamp-2">{settings.heroSubtitle}</p>
                      
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <span 
                          style={{ backgroundColor: settings.primaryColor }}
                          className="px-4 py-1.5 rounded-lg text-[9px] font-bold text-white shadow-sm inline-block cursor-default"
                        >
                          {settings.heroCtaText}
                        </span>
                        <span className="px-4 py-1.5 rounded-lg text-[9px] font-bold bg-white text-slate-800 border border-slate-200/80 shadow-sm inline-block cursor-default">
                          Thực đơn
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    (Khối Hero Banner đã bị tắt)
                  </div>
                )}

                {/* Mocked site contents below hero */}
                <div className="p-4 space-y-4 flex-1">
                  
                  {/* Two card blocks */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 space-y-2">
                      <div className="w-full aspect-[4/3] rounded-lg bg-slate-200/80 shadow-inner flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">ẢNH</div>
                      <div className="h-2.5 w-16 bg-slate-300 rounded" />
                      <div className="h-2 w-10 bg-slate-200 rounded" />
                    </div>

                    <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 space-y-2">
                      <div className="w-full aspect-[4/3] rounded-lg bg-slate-200/80 shadow-inner flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">ẢNH</div>
                      <div className="h-2.5 w-14 bg-slate-300 rounded" />
                      <div className="h-2 w-8 bg-slate-200 rounded" />
                    </div>
                  </div>

                  {/* Simulated loading skeletal lines */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 shrink-0">
                    <div className="h-3 w-3/4 bg-slate-200/80 rounded" />
                    <div className="h-2.5 w-full bg-slate-100 rounded" />
                    <div className="h-2.5 w-5/6 bg-slate-100 rounded" />
                  </div>

                  {/* Dot navigation indicators */}
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>

                </div>

              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
