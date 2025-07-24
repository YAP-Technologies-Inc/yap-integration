// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import RootProvider from '@/components/RootProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Yap2Learn',
  description: 'Making language learning fun and rewarding',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-secondary">
      <body
        className={`${outfit.variable} font-sans antialiased`}
        style={{
          fontFamily: 'var(--font-outfit), Arial, Helvetica, sans-serif',
        }}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
