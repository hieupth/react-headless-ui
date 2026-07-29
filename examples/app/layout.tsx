import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';

export const metadata: Metadata = {
  title: '@hieupth/react-headless-ui — Headless React UI',
  description: 'Headless React UI primitives — composition over inheritance',
};

// Runs synchronously before first paint to apply the persisted/system theme,
// preventing a flash of the wrong theme (FOUC). Mirrors the resolution logic in
// ThemeSwitcher: stored 'dark' wins, else prefers-color-scheme: dark, else light.
const themeInitScript = `(function(){try{var k='react-headless-ui-theme';var s=localStorage.getItem(k);var d=s==='dark'||(s==null&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 min-w-0 flex-col">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur px-4 py-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                @hieupth/react-headless-ui
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
