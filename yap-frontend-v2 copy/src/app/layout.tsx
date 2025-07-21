import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-secondary">
      <body
        className={`${outfit.variable} font-sans antialiased`}
        style={{
          fontFamily: 'var(--font-outfit), Arial, Helvetica, sans-serif',
        }}
      >
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
