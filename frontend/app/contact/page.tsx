'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight,
  Send,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useBannersQuery } from '../../hooks/useContentQueries';
import { apiFetch, resolveUploadUrl } from '../../lib/api';

// Define strict typing schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống'),
  email: z.string().min(1, 'Email không được để trống').email('Địa chỉ email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải chứa ít nhất 10 chữ số'),
  content: z.string().min(1, 'Nội dung phản hồi không được để trống'),
});

type ContactFormInput = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  useScrollAnimation();
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const { data: banners = [] } = useBannersQuery();

  const activeBanner = banners.find((b) => b.position === 'CONTACT_HERO');
  const bgImage = activeBanner ? resolveUploadUrl(activeBanner.imageUrl) : 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200';
  const pageTitle = activeBanner ? activeBanner.title : 'LIÊN HỆ';
  const pageSubtitle = activeBanner ? activeBanner.linkUrl : 'Express Cafe';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormInput) => {
    try {
      await apiFetch<Record<string, unknown>>('/admin/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          content: data.content,
        }),
      });
      setIsSubmitSuccess(true);
      reset();
      setTimeout(() => setIsSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting contact inquiry:', error);
      alert('Đã xảy ra lỗi khi gửi thông tin liên hệ. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[180px] md:h-[220px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.65)), url(${bgImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          {pageSubtitle && (
            <span data-animate="fade-down" className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-orange-400 mb-3 bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
              {pageSubtitle}
            </span>
          )}
          <h1 data-animate="blur-in" className="text-4xl md:text-5xl font-heading italic text-white uppercase tracking-wider leading-none mt-2">
            {pageTitle}
          </h1>
          
          {/* Breadcrumbs */}
          <div data-animate="fade-up" data-delay="300" className="flex items-center justify-center gap-2 text-zinc-300 font-body text-xs font-light mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Liên hệ</span>
          </div>
        </div>
        
        {/* Decorative Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-8 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
          </svg>
        </div>
      </section>

      {/* 3. Main Body: 2-Column Map & Info Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Vertical Interactive Maps Frame */}
          <div 
            data-animate="fade-right" 
            data-delay="100"
            className="lg:col-span-5 h-[500px] lg:h-auto min-h-[450px] relative rounded-[32px] overflow-hidden shadow-2xl border border-zinc-200/80 hover:scale-[1.01] hover:shadow-orange-500/5 transition-all duration-500"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.824285818967!2d106.7262194153338!3d10.748011262657375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752579dfd9e29f%3A0xe54e6371cf7ef31e!2zMTEyIEzDvSBQaOG7pWMgTWFuLCBUw6JuIFthdeG6rW4sIFF14bqtbiA3LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1780000000000!5m2!1sen!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Aizen World Office Map"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Right Column: Contact info and Question inputs form */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-10" data-animate="fade-left" data-delay="200">
            
            {/* Contact Information Box */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3.5 py-1.5 rounded-full">
                  Kết nối với chúng tôi
                </span>
                <h2 className="text-2xl md:text-3.5xl font-black text-zinc-950 mt-4 leading-tight tracking-tight uppercase">
                  Thông Tin Liên Hệ
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 mt-2 leading-relaxed font-light">
                  Chúng tôi luôn sẵn sàng lắng nghe, hợp tác nhượng quyền và hỗ trợ giải quyết mọi thắc mắc của quý đối tác & khách hàng.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div data-animate="fade-up" data-delay="100" className="flex gap-3 bg-[#fbf7f2] p-5 rounded-[22px] border border-orange-100/60 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wide">Địa chỉ</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">112 Lý Phục Man, Phường Tân Thuận, Quận 7, Thành phố Hồ Chí Minh</p>
                  </div>
                </div>

                <div data-animate="fade-up" data-delay="200" className="flex gap-3 bg-[#fbf7f2] p-5 rounded-[22px] border border-orange-100/60 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wide">Email</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed break-all font-light">info@aizenworld.com</p>
                  </div>
                </div>

                <div data-animate="fade-up" data-delay="300" className="flex gap-3 bg-[#fbf7f2] p-5 rounded-[22px] border border-orange-100/60 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/10">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wide">Điện thoại</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">0362 077 399</p>
                  </div>
                </div>

                <div data-animate="fade-up" data-delay="400" className="flex gap-3 bg-[#fbf7f2] p-5 rounded-[22px] border border-orange-100/60 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/10">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wide">Thời gian làm việc</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">Thứ 2 - Thứ 6: 07:00 - 21:00<br />Thứ 7 - CN: 07:30 - 22:00</p>
                  </div>
                </div>
              </div>

              <div>
                <a 
                  href="https://maps.google.com/?q=112+Lý+Phục+Man,+Phường+Tân+Thuận,+Quận+7,+Thành+phố+Hồ+Chí+Minh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-lg shadow-orange-500/15 active:scale-95 uppercase tracking-wider"
                >
                  XEM TRÊN BẢN ĐỒ LỚN HƠN
                </a>
              </div>
            </div>

            {/* Questions Form Box */}
            <div data-animate="fade-up" data-delay="200" className="border-t border-zinc-150 pt-8 space-y-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-lg text-zinc-950 uppercase tracking-wide">Gửi thắc mắc cho chúng tôi</h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Form success banner */}
                {isSubmitSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-250/20 text-emerald-600 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2.5 animate-pulse">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                    <span>Chúng tôi đã tiếp nhận thông tin phản hồi của bạn và sẽ phản hồi qua Email/SĐT sớm nhất!</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    {...register('name')}
                    className="w-full px-4 py-3 bg-zinc-55 hover:bg-white focus:bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Địa chỉ Email *</label>
                    <input 
                      type="email"
                      required
                      placeholder="VD: info@aizenworld.com"
                      {...register('email')}
                      className="w-full px-4 py-3 bg-zinc-55 hover:bg-white focus:bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="VD: 0362077399"
                      {...register('phone')}
                      className="w-full px-4 py-3 bg-zinc-55 hover:bg-white focus:bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Nội dung thắc mắc *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Mô tả chi tiết thắc mắc cần hỗ trợ hoặc thông tin trao đổi..."
                    {...register('content')}
                    className="w-full px-4 py-3 bg-zinc-55 hover:bg-white focus:bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.content.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-950 hover:bg-orange-500 disabled:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>GỬI LIÊN HỆ</span>
                    </>
                  )}
                </button>

              </form>
            </div>

          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />

    </div>
  );
}
