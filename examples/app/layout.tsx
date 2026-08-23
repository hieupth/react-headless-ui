import './globals.css';
import './showcase.css';
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
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="app-content">
            <header className="app-header">
              <span className="app-brand">@hieupth/react-headless-ui</span>
              <ThemeSwitcher />
            </header>
            <main className="app-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
