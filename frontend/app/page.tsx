import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Express Cafe | Cà Phê Nguyên Chất & Nhượng Quyền 0đ',
  description: 'Trang chủ Express Cafe. Khám phá mô hình nhượng quyền xe đẩy, ki-ốt cafe lợi nhuận cao, cung cấp máy pha và hạt cà phê Robusta, Arabica rang mộc nguyên chất chất lượng cao.',
};

export default function Home() {
  return <HomeClient />;
}
