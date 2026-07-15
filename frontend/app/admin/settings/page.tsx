'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  Globe, 
  Home, 
  Palette, 
  Sparkles, 
  Coffee, 
  Phone, 
  Share2, 
  ToggleLeft, 
  ToggleRight, 
  Layout, 
  Trash2, 
  Upload, 
  Search 
} from 'lucide-react';
import { adminSettingsApi, adminMediaApi } from '@/lib/admin-api';
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

  seoTitle: 'Express Cafe - Cà Phê Rang Xay Nguyên Chất',
  seoDescription: 'Express Cafe cung cấp giải pháp cà phê chất lượng cao và dịch vụ chu đáo.',
  seoKeywords: 'express cafe, ca phe sach, ca phe nguyen chat',
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
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'HOMEPAGE' | 'APPEARANCE' | 'SEO'>('GENERAL');
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Hidden File Inputs Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroBgInputRef = useRef<HTMLInputElement>(null);

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
        if (v !== undefined) {
          rawPayload[k] = v;
        }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof SiteSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    setUploadingField(key);
    try {
      const res = await adminMediaApi.upload(file);
      if (res && res.cdnUrl) {
        handleChange(key, res.cdnUrl);
        toast.success('Tải lên ảnh thành công!');
      } else {
        throw new Error('Đường dẫn CDN trống');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải ảnh lên server');
    } finally {
      setUploadingField(null);
      // Reset input value to allow upload same file
      e.target.value = '';
    }
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
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cài đặt hệ thống</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">Cấu hình nhận diện thương hiệu, thông tin liên hệ, khối trang chủ và SEO website.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Config Form (Spans 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap border border-slate-200 bg-slate-100/60 p-1 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('GENERAL')}
              className={`flex items-center justify-center gap-2 flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'GENERAL'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Chung & MXH
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('HOMEPAGE')}
              className={`flex items-center justify-center gap-2 flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HOMEPAGE'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Trang chủ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('APPEARANCE')}
              className={`flex items-center justify-center gap-2 flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'APPEARANCE'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Giao diện
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SEO')}
              className={`flex items-center justify-center gap-2 flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SEO'
                  ? 'bg-white text-[#0047cc] shadow-md border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> SEO
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TAB 1: GENERAL CONFIGS */}
            {activeTab === 'GENERAL' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm animate-fade-in">
                
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-[#0047cc]" /> Thông tin chung thương hiệu
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
                      
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 bg-white relative overflow-hidden shadow-inner">
                        {uploadingField === 'logoUrl' ? (
                          <div className="w-5 h-5 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
                        ) : settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Coffee className="w-8 h-8" />
                            <span className="text-[9px] mt-1 font-bold">COFFEE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={(e) => handleImageUpload(e, 'logoUrl')}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingField !== null}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
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
                          Định dạng PNG, JPG, WEBP hoặc SVG. Dung lượng tối đa 5MB. Đề xuất tỉ lệ vuông 512×512px.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload Container */}
                  <div className="space-y-2.5 mt-5">
                    <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Favicon (Biểu tượng trình duyệt)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                      
                      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 bg-white relative overflow-hidden shadow-inner">
                        {uploadingField === 'faviconUrl' ? (
                          <div className="w-4 h-4 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
                        ) : settings.faviconUrl ? (
                          <img src={settings.faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Globe className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <input
                            type="file"
                            ref={faviconInputRef}
                            onChange={(e) => handleImageUpload(e, 'faviconUrl')}
                            accept="image/x-icon,image/png,image/jpeg,image/svg+xml"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => faviconInputRef.current?.click()}
                            disabled={uploadingField !== null}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {settings.faviconUrl ? 'Thay đổi Favicon' : 'Tải lên mới'}
                          </button>
                          {settings.faviconUrl && (
                            <button
                              type="button"
                              onClick={() => handleChange('faviconUrl', '')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa Favicon
                            </button>
                          )}
                        </div>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                          Định dạng .ico, .png, .jpg hoặc .svg. Đề xuất tỉ lệ vuông 1:1.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Contact & Address Section */}
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4 text-[#0047cc]" /> Thông tin liên hệ & Địa chỉ
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
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Địa chỉ trụ sở chính</label>
                      <input
                        value={settings.address}
                        onChange={(e) => handleChange('address', e.target.value)}
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
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0047cc]" /> Biểu ngữ chính (Hero Section)
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleChange('heroEnabled', !settings.heroEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.heroEnabled ? (
                        <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {settings.heroEnabled && (
                    <div className="space-y-4 pt-1 animate-fade-in">
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

                      {/* Hero BG Image Upload Container */}
                      <div className="space-y-2.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Ảnh nền Hero Section</label>
                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                          
                          <div className="w-32 h-20 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 bg-white relative overflow-hidden shadow-inner">
                            {uploadingField === 'heroBgImage' ? (
                              <div className="w-5 h-5 border-2 border-[#0047cc] border-t-transparent rounded-full animate-spin" />
                            ) : settings.heroBgImage ? (
                              <img src={settings.heroBgImage} alt="Hero BG" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-slate-300 text-xs font-bold">Không có ảnh</div>
                            )}
                          </div>
                          
                          <div className="flex-1 w-full text-center sm:text-left space-y-3">
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                              <input
                                type="file"
                                ref={heroBgInputRef}
                                onChange={(e) => handleImageUpload(e, 'heroBgImage')}
                                accept="image/*"
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => heroBgInputRef.current?.click()}
                                disabled={uploadingField !== null}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {settings.heroBgImage ? 'Thay đổi ảnh' : 'Tải lên mới'}
                              </button>
                              {settings.heroBgImage && (
                                <button
                                  type="button"
                                  onClick={() => handleChange('heroBgImage', '')}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Xóa ảnh
                                </button>
                              )}
                            </div>
                            <p className="text-slate-400 text-[10px] leading-relaxed font-semibold">
                              Ảnh nền nằm ngang. Đề xuất tỉ lệ 16:9 hoặc tối thiểu 1200x600px.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slideshow section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        <Layout className="w-4 h-4 text-[#0047cc]" /> Khối Trình chiếu Banner (Slideshow)
                      </h3>
                      <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Bật/Tắt slideshow chạy tự động đầu trang chủ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('bannerSlideshowEnabled', !settings.bannerSlideshowEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.bannerSlideshowEnabled ? (
                        <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Service section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-[#0047cc]" /> Khối Dịch vụ (Services Section)
                      </h3>
                      <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Bật/Tắt khối giới thiệu Dịch vụ (Thuê máy, sửa chữa...)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('serviceSectionEnabled', !settings.serviceSectionEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.serviceSectionEnabled ? (
                        <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Blog section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#0047cc]" /> Khối Tin tức & Bài viết (Blog Section)
                      </h3>
                      <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Bật/Tắt khối bài viết tin tức trang chủ và số lượng hiển thị</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('blogSectionEnabled', !settings.blogSectionEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.blogSectionEnabled ? (
                        <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {settings.blogSectionEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase block">Tiêu đề khối Tin tức</label>
                        <input
                          value={settings.blogSectionTitle}
                          onChange={(e) => handleChange('blogSectionTitle', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase block">Số bài viết hiển thị</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={settings.blogSectionCount}
                          onChange={(e) => handleChange('blogSectionCount', Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Branch section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#0047cc]" /> Khối Bản đồ Chi nhánh (Branch Section)
                      </h3>
                      <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Bật/Tắt khối bản đồ hệ thống cửa hàng ở trang chủ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('branchSectionEnabled', !settings.branchSectionEnabled)}
                      className="cursor-pointer"
                    >
                      {settings.branchSectionEnabled ? (
                        <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                      ) : (
                        <ToggleLeft className="w-11 h-7 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {settings.branchSectionEnabled && (
                    <div className="space-y-1.5 pt-1 animate-fade-in">
                      <label className="text-slate-700 text-xs font-bold uppercase block">Tiêu đề khối Chi nhánh</label>
                      <input
                        value={settings.branchSectionTitle}
                        onChange={(e) => handleChange('branchSectionTitle', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: APPEARANCE CONFIGS */}
            {activeTab === 'APPEARANCE' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm animate-fade-in">
                
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#0047cc]" /> Tùy biến màu sắc nhận diện
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
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
                          <span className="text-slate-400 text-[10px] font-semibold block mt-0.5">Màu của nút bấm, liên kết chính...</span>
                        </div>
                      </div>
                    </div>

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
                      <ToggleRight className="w-11 h-7 text-[#0047cc]" />
                    ) : (
                      <ToggleLeft className="w-11 h-7 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: SEO CONFIGS */}
            {activeTab === 'SEO' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm animate-fade-in">
                <div>
                  <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0047cc]" /> Tối ưu hóa SEO & Metadata
                  </h3>
                  
                  <div className="space-y-4 mt-5">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase block">Meta Title (Tiêu đề SEO)</label>
                      <input
                        value={settings.seoTitle || ''}
                        onChange={(e) => handleChange('seoTitle', e.target.value)}
                        placeholder="Ví dụ: Express Cafe - Cà Phê Nguyên Chất & Cho Thuê Máy Pha Cà Phê"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Tiêu đề xuất hiện trên thẻ trình duyệt và Google Search. Đề xuất &lt; 60 ký tự.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase block">Meta Description (Mô tả SEO)</label>
                      <textarea
                        value={settings.seoDescription || ''}
                        onChange={(e) => handleChange('seoDescription', e.target.value)}
                        placeholder="Mô tả tóm tắt nội dung website để hiển thị trên công cụ tìm kiếm..."
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-medium leading-relaxed"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Mô tả ngắn trang web. Đề xuất &lt; 160 ký tự.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold uppercase block">Meta Keywords (Từ khóa SEO)</label>
                      <input
                        value={settings.seoKeywords || ''}
                        onChange={(e) => handleChange('seoKeywords', e.target.value)}
                        placeholder="express cafe, cho thue may ca phe, ca phe ngon"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Các từ khóa cách nhau bằng dấu phẩy.</span>
                    </div>
                  </div>
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
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-3 text-[10px] text-slate-400 text-center font-mono flex items-center justify-center gap-1">
                  <span>🔒</span>
                  <span>expresscafe.com</span>
                </div>
              </div>

              {/* simulated Web Content inside Mock */}
              <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300 ${settings.darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-slate-850'}`}>
                
                {/* Navbar inside preview */}
                <header className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-white'}`}>
                  <div className="flex items-center gap-1.5">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-4 h-4 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-[#0047cc] flex items-center justify-center">
                        <Coffee className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className={`font-bold text-xs tracking-tight transition-colors duration-300 ${settings.darkMode ? 'text-white' : 'text-slate-800'}`}>{settings.brandName}</span>
                  </div>
                  <div className="flex gap-1 flex-col justify-center">
                    <span className={`w-3.5 h-0.5 block transition-colors duration-300 ${settings.darkMode ? 'bg-zinc-300' : 'bg-slate-700'}`} />
                    <span className={`w-3.5 h-0.5 block transition-colors duration-300 ${settings.darkMode ? 'bg-zinc-300' : 'bg-slate-700'}`} />
                  </div>
                </header>

                {/* Hero Banner inside preview */}
                {settings.heroEnabled ? (
                  <div className="relative py-12 px-5 flex flex-col justify-center text-center overflow-hidden bg-slate-900 border-b border-slate-800 shrink-0">
                    <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 transition-all duration-300"
                      style={{ backgroundImage: `url(${settings.heroBgImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop'})` }} />
                    <div className="absolute inset-0 bg-slate-950/40 z-0" />
                    
                    <div className="relative z-10 space-y-2 text-white">
                      <h4 className="text-base font-black tracking-tight leading-snug">{settings.heroHeading || 'Brewed to Perfection'}</h4>
                      <p className="text-[9px] opacity-90 leading-relaxed max-w-[240px] mx-auto line-clamp-2">{settings.heroSubtitle || 'Slogan hoặc mô tả phụ của Hero Section.'}</p>
                      
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <span 
                          style={{ backgroundColor: settings.primaryColor }}
                          className="px-3.5 py-1.5 rounded-lg text-[8px] font-bold text-white shadow-sm inline-block cursor-default"
                        >
                          {settings.heroCtaText || 'Đặt Ngay'}
                        </span>
                        <span className="px-3.5 py-1.5 rounded-lg text-[8px] font-bold bg-white text-slate-800 border border-slate-200/80 shadow-sm inline-block cursor-default">
                          Thực đơn
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`py-6 border-b flex items-center justify-center text-[10px] font-semibold transition-colors duration-300 ${settings.darkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    (Khối Hero Banner đã bị tắt)
                  </div>
                )}

                {/* Simulated Content Sections */}
                <div className="p-4 space-y-4 flex-1">
                  
                  {/* Banner Slideshow Section Preview */}
                  {settings.bannerSlideshowEnabled && (
                    <div className={`border rounded-xl p-3 text-center shrink-0 transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800 bg-zinc-900/40' : 'border-orange-100 bg-orange-50/20'}`}>
                      <span className={`text-[9px] font-extrabold block uppercase tracking-wide ${settings.darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                        ✨ Banner Slideshow Khuyến Mãi
                      </span>
                      <div className="flex gap-1 justify-center mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      </div>
                    </div>
                  )}

                  {/* Services Section Preview */}
                  {settings.serviceSectionEnabled && (
                    <div className={`border rounded-xl p-3 space-y-2 shrink-0 transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                      <span className={`text-[9px] font-extrabold block uppercase tracking-wider ${settings.darkMode ? 'text-zinc-350' : 'text-slate-700'}`}>
                        ☕ Dịch vụ của chúng tôi
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className={`h-6 rounded flex items-center justify-center text-[7px] font-bold ${settings.darkMode ? 'bg-zinc-800 text-zinc-350' : 'bg-slate-200/80 text-slate-600'}`}>Cho thuê máy</div>
                        <div className={`h-6 rounded flex items-center justify-center text-[7px] font-bold ${settings.darkMode ? 'bg-zinc-800 text-zinc-350' : 'bg-slate-200/80 text-slate-600'}`}>Sửa chữa máy</div>
                        <div className={`h-6 rounded flex items-center justify-center text-[7px] font-bold ${settings.darkMode ? 'bg-zinc-800 text-zinc-350' : 'bg-slate-200/80 text-slate-600'}`}>Cà phê hạt</div>
                      </div>
                    </div>
                  )}

                  {/* Blog Section Preview */}
                  {settings.blogSectionEnabled && (
                    <div className={`space-y-2 pt-2 border-t shrink-0 transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-extrabold block uppercase tracking-wider ${settings.darkMode ? 'text-zinc-350' : 'text-slate-700'}`}>
                          📰 {settings.blogSectionTitle || 'Tin tức mới nhất'}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold">({settings.blogSectionCount} bài)</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {Array.from({ length: Math.min(settings.blogSectionCount, 2) }).map((_, i) => (
                          <div key={i} className={`flex gap-2 items-center p-1.5 rounded-lg border transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
                            <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-[7px] font-bold ${settings.darkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-400'}`}>ẢNH</div>
                            <div className="flex-1 space-y-1">
                              <div className={`h-2 w-3/4 rounded ${settings.darkMode ? 'bg-zinc-700' : 'bg-slate-300'}`} />
                              <div className={`h-1.5 w-full rounded ${settings.darkMode ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Branch Section Preview */}
                  {settings.branchSectionEnabled && (
                    <div className={`space-y-2 pt-2 border-t shrink-0 transition-colors duration-300 ${settings.darkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                      <span className={`text-[9px] font-extrabold block uppercase tracking-wider ${settings.darkMode ? 'text-zinc-350' : 'text-slate-700'}`}>
                        📍 {settings.branchSectionTitle || 'Hệ thống chi nhánh'}
                      </span>
                      <div className={`h-14 rounded-xl border border-dashed flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${settings.darkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                        🗺️ [Bản đồ cửa hàng]
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Preview inside mockup */}
                <footer className={`mt-auto px-4 py-4 border-t flex flex-col items-center gap-2 shrink-0 transition-colors duration-300 ${settings.darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200/65 text-slate-500'}`}>

                  {settings.address && (
                    <p className="text-[7px] text-center max-w-[220px] leading-normal line-clamp-2">
                      📍 {settings.address}
                    </p>
                  )}
                  <p className="text-[6px] tracking-widest font-semibold opacity-50 uppercase mt-0.5">
                    © {new Date().getFullYear()} {settings.brandName || 'Express Cafe'}
                  </p>
                </footer>

              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
