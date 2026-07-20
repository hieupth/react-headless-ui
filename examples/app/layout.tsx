import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';

export const metadata: Metadata = {
  title: '@hieupth/reui — Headless React UI',
  description: 'Headless React UI primitives — composition over inheritance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 min-w-0 flex-col">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur px-4 py-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                @hieupth/reui
              </span>
              <ThemeSwitcher />
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
