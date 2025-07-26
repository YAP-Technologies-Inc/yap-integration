'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import yapLogo from '../assets/YAP.webp';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // fast navigation to auth page
    requestAnimationFrame(() => {
      router.push('/auth');
    });
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-background-primary">
      <Image
        src={yapLogo}
        alt="YAP Logo"
        width={160}
        height={160}
        priority
        placeholder="blur"
      />
    </main>
  );
}
