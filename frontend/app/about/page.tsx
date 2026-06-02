'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const STORY_IMAGES = [
  '/p-about-stories_1.jpg',
  '/p-about-stories_2.jpg',
  '/p-about-stories_3.jpg',
  '/p-about-stories_4.jpg',
];

const INTRO_CARDS = [
  {
    title: 'Tầm nhìn',
    content:
      'Trở thành chuỗi cà phê Việt Nam hiện đại, gọn nhẹ, dễ nhân rộng và luôn giữ được tinh thần bản địa gần gũi.',
  },
  {
    title: 'Sứ mệnh',
    content:
      'Express Cafe giúp đối tác khởi nghiệp nhanh hơn, vận hành tinh gọn hơn và kiểm soát chi phí hiệu quả hơn.',
  },
  {
    title: 'Lĩnh vực hoạt động',
    content:
      'Nhượng quyền mô hình cà phê, cung cấp nguyên liệu, tư vấn setup và đồng hành vận hành chuỗi cửa hàng.',
  },
  {
    title: 'Ý nghĩa thương hiệu Express Cafe',
    content:
      '“Express” là tốc độ, tinh gọn và hiện đại. “Cafe” là sự gần gũi, nguyên bản và đậm chất Việt.',
  },
  {
    title: 'Giá trị cốt lõi',
    content:
      'Khách hàng là trung tâm. Chất lượng là nền tảng. Hỗ trợ là cam kết. Hợp tác là sức mạnh phát triển.',
  },
];

const COMMITMENTS = [
  {
    title: 'Đồng hành trọn đời',
    text:
      'Chúng tôi không chỉ bàn giao mô hình mà còn tiếp tục đồng hành trong quá trình vận hành, tối ưu và mở rộng.',
    image: STORY_IMAGES[0],
    align: 'left' as const,
  },
  {
    title: 'Marketing và quảng cáo',
    text:
      'Xây dựng bộ nhận diện, nội dung truyền thông và chiến lược hình ảnh để điểm bán nổi bật hơn trên thị trường.',
    image: STORY_IMAGES[1],
    align: 'right' as const,
  },
  {
    title: 'Hỗ trợ nhanh chóng',
    text:
      'Đội ngũ vận hành luôn sẵn sàng phản hồi, hỗ trợ và xử lý các vấn đề kỹ thuật hoặc nghiệp vụ khi cần.',
    image: STORY_IMAGES[2],
    align: 'left' as const,
  },
  {
    title: 'Tôn trọng và hợp tác',
    text:
      'Chúng tôi xây dựng mối quan hệ lâu dài dựa trên sự minh bạch, tôn trọng và trách nhiệm với từng đối tác.',
    image: STORY_IMAGES[3],
    align: 'right' as const,
  },
];

function SectionCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="border border-zinc-900 bg-[#fff7eb] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-[11px] leading-6 text-zinc-700">{content}</p>
    </div>
  );
}

export default function AboutPage() {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />

      <section
        className="relative h-[165px] overflow-hidden border-b border-zinc-200"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(33, 24, 18, 0.92), rgba(33, 24, 18, 0.42)), url(/h-about_banner.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <div className="text-white">
            <p className="text-xl font-semibold uppercase tracking-[0.22em] md:text-2xl">
              GIỚI THIỆU
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/80">
              <Link href="/" className="hover:text-orange-300">
                Trang chủ
              </Link>
              <span className="text-white/50">|</span>
              <span>Giới thiệu</span>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[370px_minmax(0,1fr)]">
            <div className="relative justify-self-start" data-animate="fade-right">
              <div className="absolute left-8 top-6 h-[270px] w-[135px] border-[3px] border-orange-500" />
              <div className="relative z-10 ml-16 w-[210px]">
                <Image
                  src={STORY_IMAGES[0]}
                  alt="Đội ngũ Express Cafe"
                  width={210}
                  height={120}
                  className="h-[120px] w-full object-cover shadow-md"
                  priority
                />
                <Image
                  src={STORY_IMAGES[1]}
                  alt="Hoạt động Express Cafe"
                  width={210}
                  height={120}
                  className="mt-1 h-[120px] w-full object-cover shadow-md"
                />
                <div className="absolute -right-4 top-[238px] flex h-10 w-5 flex-col items-center justify-center bg-orange-500 text-white shadow-lg">
                  <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                  <ChevronDown className="-mt-1 h-3 w-3 rotate-[-90deg]" />
                </div>
              </div>
            </div>

            <div data-animate="fade-left">
              <p className="text-sm text-zinc-500">Câu chuyện thương hiệu</p>
              <h2 className="mt-2 text-[27px] font-bold uppercase tracking-[0.04em] text-zinc-950 md:text-[30px]">
                EXPRESS CAFE: CÀ PHÊ ĐẬM VỊ - SỐNG ĐẬM CHẤT
              </h2>
              <div className="mt-4 space-y-4 max-w-4xl text-[12px] leading-7 text-zinc-600">
                <p>
                  Câu chuyện về nơi cà phê của Express Cafe bắt đầu từ một nguyên lý rất đơn
                  giản: một ly cà phê tốt không chỉ nằm ở hương vị, mà còn nằm ở trải nghiệm
                  vận hành, tính ổn định và sự đồng hành cùng đối tác.
                </p>
                <p>
                  Từ đó, Express Cafe được xây dựng như một hệ sinh thái nơi mỗi điểm bán đều có
                  thể vận hành tinh gọn, nhân rộng và giữ được bản sắc riêng. Chúng tôi hướng đến
                  mô hình kinh doanh hiện đại, bền vững và giàu cảm xúc, nơi từng chi tiết đều
                  phản ánh tinh thần “đậm vị - sống đậm chất”.
                </p>
              </div>
              <Link
                href="/franchise"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-orange-600"
              >
                Xem thêm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8c58f_0%,#fee1be_18%,#fff4e1_44%,#fffdf4_100%)] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-9 text-2xl font-bold uppercase tracking-[0.04em] text-zinc-950">
              GIỚI THIỆU CHUNG
            </h2>

            <div className="grid items-center gap-6 lg:grid-cols-[1fr_300px_1fr]">
              <div className="space-y-4" data-animate="fade-right">
                <SectionCard title={INTRO_CARDS[0].title} content={INTRO_CARDS[0].content} />
                <SectionCard title={INTRO_CARDS[1].title} content={INTRO_CARDS[1].content} />
                <SectionCard title={INTRO_CARDS[2].title} content={INTRO_CARDS[2].content} />
              </div>

              <div className="relative mx-auto w-full max-w-[300px]" data-animate="scale-up">
                <div className="absolute inset-0 translate-x-4 translate-y-4 bg-orange-500/12" />
                <Image
                  src="/p-about-sv_1.jpg"
                  alt="Express Cafe quầy phục vụ"
                  width={300}
                  height={250}
                  className="relative z-10 h-[250px] w-full object-cover shadow-xl"
                />
              </div>

              <div className="space-y-4" data-animate="fade-left">
                <SectionCard title={INTRO_CARDS[3].title} content={INTRO_CARDS[3].content} />
                <SectionCard title={INTRO_CARDS[4].title} content={INTRO_CARDS[4].content} />

                <div className="border border-zinc-900 bg-[#fff7eb] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-semibold text-zinc-950">Cam kết nền tảng</p>
                  <ul className="mt-2 space-y-1 text-[11px] leading-6 text-zinc-700">
                    <li>• Chất lượng ổn định</li>
                    <li>• Hỗ trợ đối tác nhanh</li>
                    <li>• Vận hành tinh gọn</li>
                    <li>• Tăng trưởng bền vững</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-[size:14px_14px] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-2xl font-bold uppercase tracking-[0.04em] text-zinc-950">
              CAM KẾT CỦA CHÚNG TÔI
            </h2>

            <div className="space-y-12">
              {COMMITMENTS.map((item, index) => {
                const imageFirst = index % 2 === 0;

                return (
                  <div
                    key={item.title}
                    className={`grid items-center gap-6 lg:grid-cols-2 ${
                      imageFirst ? '' : '[&>*:first-child]:order-2 [&>*:last-child]:order-1'
                    }`}
                    data-animate={imageFirst ? 'fade-right' : 'fade-left'}
                  >
                    <div className="relative overflow-hidden shadow-lg">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={700}
                        height={360}
                        className="h-[230px] w-full object-cover md:h-[280px]"
                      />
                      <div
                        className={`absolute bottom-0 ${
                          imageFirst ? 'left-0' : 'right-0'
                        } max-w-[78%] bg-orange-500 px-4 py-3 text-white`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                          Express Cafe
                        </p>
                        <h3 className="mt-1 text-sm font-bold uppercase tracking-[0.04em]">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="px-2 md:px-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-500">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold uppercase tracking-[0.04em] text-zinc-950">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-[12px] leading-7 text-zinc-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
