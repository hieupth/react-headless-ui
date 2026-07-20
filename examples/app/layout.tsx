import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '@hieupth/react-headless-ui — Headless React UI',
  description: 'Headless React UI primitives — composition over inheritance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
