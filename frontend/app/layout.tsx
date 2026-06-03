import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Express Cafe | Premium F&B SaaS & Franchise Management',
  description: 'Manage sales, customers, loyalty rewards, and franchise networks with ultimate speed and premium experience.',
};

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
