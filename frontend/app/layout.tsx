import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

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
      description: settings.seoDescription || 'Express Cafe cung cấp giải pháp cà phê chất lượng cao và dịch vụ chu đáo.',
      keywords: settings.seoKeywords || 'express cafe, ca phe sach, ca phe nguyen chat',
    };
  } catch (error) {
    console.error('Error generating layout metadata:', error);
    return {
      title: 'Express Cafe | Premium F&B SaaS & Franchise Management',
      description: 'Manage sales, customers, loyalty rewards, and franchise networks with ultimate speed and premium experience.',
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full ${beVietnamPro.variable} ${lora.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 dark:bg-zinc-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
