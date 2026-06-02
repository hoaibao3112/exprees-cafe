import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

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
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 dark:bg-zinc-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
