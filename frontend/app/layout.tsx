import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
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
    <html lang="vi" className={`${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 dark:bg-zinc-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
