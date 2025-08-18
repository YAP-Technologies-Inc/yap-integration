// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  title: 'Yap',
  description: 'Making language learning fun and rewarding',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background-primary">
      <body
        className={`${outfit.variable} font-sans antialiased`}
        style={{
          fontFamily: 'var(--font-outfit), Arial, Helvetica, sans-serif',
        }}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
