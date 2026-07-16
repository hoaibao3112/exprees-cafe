import type { Metadata } from 'next';
import HomeClient from './HomeClient';

import { API_BASE_URL } from '@/lib/api-config';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/settings/public`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const responseJson = await res.json();
    const settings = responseJson.data;

    return {
      title: settings.seoTitle || 'Express Cafe | Cà Phê Nguyên Chất & Nhượng Quyền 0đ',
      description: settings.seoDescription || 'Trang chủ Express Cafe. Khám phá mô hình nhượng quyền xe đẩy, ki-ốt cafe lợi nhuận cao.',
      keywords: settings.seoKeywords || 'express cafe, ca phe sach, ca phe nguyen chat',
    };
  } catch (error) {
    console.error('Error generating homepage metadata:', error);
    return {
      title: 'Express Cafe | Cà Phê Nguyên Chất & Nhượng Quyền 0đ',
      description: 'Trang chủ Express Cafe. Khám phá mô hình nhượng quyền xe đẩy, ki-ốt cafe lợi nhuận cao, cung cấp máy pha và hạt cà phê Robusta, Arabica rang mộc nguyên chất chất lượng cao.',
    };
  }
}

export default function Home() {
  return <HomeClient />;
}
