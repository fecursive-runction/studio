import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/sidebar';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'kiln.AI',
  description: 'AI-powered cement plant optimization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <AppHeader />
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
