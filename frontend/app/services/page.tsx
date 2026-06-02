'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useServicesQuery, Article } from '../../hooks/useContentQueries';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

export default function ServicesPage() {
  // Activate scroll animations
  useScrollAnimation();

  const [selectedService, setSelectedService] = useState<Article | null>(null);
  const [consultForm, setConsultForm] = useState({ name: '', phone: '', note: '' });
  const [formFeedback, setFormFeedback] = useState(false);

  // Fetch F&B services dynamically from backend via content/articles filtering
  const { data: services, isLoading } = useServicesQuery();

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.name || !consultForm.phone) return;
    
    // Simulate consultation registry
    setFormFeedback(true);
    setTimeout(() => {
      setFormFeedback(false);
      setConsultForm({ name: '', phone: '', note: '' });
      setSelectedService(null);
    }, 2000);
  };

  // Unique F&B value-add benefits based on the selected service
  const getServiceBenefits = (slug: string): string[] => {
    switch (slug) {
      case 'cung-cap-ca-phe-si':
        return [
          'Hạt cà phê hữu cơ 100% Robusta & Arabica xuất xứ Tây Nguyên.',
          'Quy trình rang xay hiện đại đạt chuẩn ISO 22000.',
          'Chính sách chiết khấu lũy tiến hấp dẫn lên đến 35%.',
          'Miễn phí vận chuyển nội thành cho đơn hàng từ 10kg.'
        ];
      case 'sua-may-ca-phe-chuyen-nghiep':
        return [
          'Đội ngũ kỹ sư giàu kinh nghiệm thực chiến trên 5 năm.',
          'Cam kết linh kiện nhập khẩu chính hãng Ý, Tây Ban Nha 100%.',
          'Khắc phục sự cố nhanh chóng trong vòng 2-4h khu vực nội thành.',
          'Bảo hành chính hãng sau sửa chữa từ 3 đến 6 tháng.'
        ];
      case 'cho-thue-may-ca-phe':
        return [
          'Miễn phí đặt cọc máy cho văn phòng và chuỗi F&B liên kết.',
          'Bảo dưỡng định kỳ miễn phí hàng tháng.',
          'Tặng kèm bộ ly, muỗng và ca đong inox cao cấp.',
          'Hỗ trợ đổi dòng máy lớn hơn khi doanh số quán tăng trưởng.'
        ];
      case 'tu-van-setup-quan-tron-goi':
        return [
          'Tối ưu hóa thiết kế mặt bằng và quầy bar theo nguyên lý 1 chiều.',
          'Menu đồ uống đa dạng, bắt trend và định phí vốn (costing) tối ưu.',
          'Đào tạo pha chế trực tiếp bởi các Barista Trainer cúp vàng quốc gia.',
          'Chuyển giao phần mềm quản lý POS & CMS thông minh.'
        ];
      default:
        return [
          'Nguyên liệu chất lượng cao có đầy đủ giấy công bố chất lượng.',
          'Cam kết nguồn cung ổn định lâu dài không bị đứt gãy hàng.',
          'Cung cấp mẫu thử (sample) miễn phí trước khi ký hợp đồng.',
          'Hỗ trợ tư vấn công thức pha chế sáng tạo mới hàng tháng.'
        ];
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans flex flex-col justify-between antialiased">
      
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Hero Banner Section */}
      <section 
        className="relative w-full h-[180px] md:h-[220px] bg-zinc-900 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=1200')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider leading-none" data-animate="blur-in">
            Các Dịch Vụ
          </h1>
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold mt-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500 font-bold">Các dịch vụ</span>
          </div>
        </div>
        
        {/* Decorative Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-8 fill-zinc-50" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
          </svg>
        </div>
      </section>

      {/* 3. Services Listing Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        
        {/* Descriptive Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-animate="fade-up">
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3.5 py-1.5 rounded-full">
            Giải pháp F&B chuyên nghiệp
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black text-zinc-950 mt-4 leading-tight tracking-tight">
            Chúng Tôi Đồng Hành Cùng Bạn
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-3 leading-relaxed">
            Express Cafe mang đến hệ sinh thái sản phẩm, nguyên vật liệu và giải pháp kỹ thuật công nghệ toàn diện giúp bạn vận hành kinh doanh quán đạt hiệu quả tối ưu và bền vững.
          </p>
        </div>

        {/* Dynamic Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-150 p-4 shadow-sm animate-pulse">
                <div className="w-full aspect-[4/3] bg-zinc-200 rounded-2xl mb-4" />
                <div className="h-6 bg-zinc-200 rounded w-2/3 mb-2" />
                <div className="h-12 bg-zinc-200 rounded mb-4" />
                <div className="h-10 bg-zinc-200 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-lg mx-auto shadow-sm" data-animate="scale-up">
            <Coffee className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="font-bold text-base text-zinc-700">Chưa có dịch vụ nào</h3>
            <p className="text-xs text-zinc-400 mt-1">Hệ thống đang được cập nhật thêm các gói dịch vụ mới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.id}
                data-animate="fade-up"
                data-delay={String(((index % 3) + 1) * 100)}
                className="group bg-white rounded-3xl border border-zinc-150 overflow-hidden hover:border-orange-300 hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <img 
                      src={service.imageUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=500&auto=format&fit=crop'} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6">
                    <h3 className="font-extrabold text-base text-zinc-950 group-hover:text-orange-500 transition-colors duration-355 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-3 leading-relaxed line-clamp-3 min-h-[3.3rem] font-light">
                      {service.contentHtml}
                    </p>
                  </div>
                </div>

                {/* Card Button Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider text-center rounded-2xl transition-all duration-300 shadow-md shadow-orange-500/10 cursor-pointer active:scale-[0.98]"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* 4. Interactive Detail Modal Drawer & Consultation Form */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl relative border border-zinc-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header info */}
            <div className="relative h-56 md:h-64 w-full bg-zinc-100">
              <img 
                src={selectedService.imageUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=500&auto=format&fit=crop'} 
                alt={selectedService.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent flex flex-col justify-end p-6" />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-extrabold text-orange-400 bg-orange-500/15 border border-orange-500/20 px-3 py-1 rounded-lg uppercase tracking-wider">
                  Dịch vụ liên kết F&B
                </span>
                <h2 className="text-xl md:text-3xl font-black text-white mt-2.5 leading-tight uppercase tracking-wide">
                  {selectedService.title}
                </h2>
              </div>
            </div>

            {/* Content & Form Details Grid */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Description & Benefits list (md:col-span-7) */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-950 uppercase tracking-widest flex items-center gap-2 pb-2.5 border-b border-zinc-100">
                    <Sparkles className="w-4 h-4 text-orange-500" /> Về dịch vụ của chúng tôi
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed mt-3.5 font-light">
                    {selectedService.contentHtml}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <h4 className="font-extrabold text-xs text-zinc-800 tracking-wide">
                    Quyền lợi của đối tác đồng hành:
                  </h4>
                  <ul className="space-y-3">
                    {getServiceBenefits(selectedService.slug).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-600 leading-relaxed font-light">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Contact Consultation Form (md:col-span-5) */}
              <div className="md:col-span-5">
                <div className="p-6 bg-zinc-50 border border-zinc-200/80 rounded-3xl flex flex-col gap-4 shadow-sm">
                  <h3 className="font-extrabold text-xs text-zinc-950 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200 pb-2.5">
                    <MessageSquare className="w-4.5 h-4.5 text-orange-500" /> Nhận tư vấn ngay
                  </h3>
                  
                  <form onSubmit={handleConsultSubmit} className="flex flex-col gap-3.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                      <input 
                        type="text"
                        required
                        value={consultForm.name}
                        onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                        placeholder="Nhập họ và tên..."
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                      <input 
                        type="tel"
                        required
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                        placeholder="Nhập số điện thoại..."
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-1.5">Ghi chú yêu cầu</label>
                      <textarea 
                        rows={2}
                        value={consultForm.note}
                        onChange={(e) => setConsultForm({ ...consultForm, note: e.target.value })}
                        placeholder="VD: Tư vấn chi tiết báo giá..."
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder-zinc-400"
                      />
                    </div>

                    {formFeedback && (
                      <div className="p-3 bg-emerald-50 border border-emerald-250/20 text-emerald-600 rounded-2xl text-[10px] leading-relaxed text-center font-semibold animate-pulse">
                        Đăng ký thành công! Đội ngũ tư vấn sẽ liên hệ bạn ngay lập tức.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formFeedback}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 active:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center active:scale-[0.98] shadow-md shadow-orange-500/10"
                    >
                      {formFeedback ? 'ĐANG GỬI...' : 'ĐĂNG KÝ NGAY'}
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. Footer */}
      <Footer />

    </div>
  );
}
