'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // fast navigation to auth page
    requestAnimationFrame(() => {
      router.push('/auth');
    });
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen mb-20">
      <img
        src="/assets/yapred.png"
        alt="YAP Logo"
        className="w-[200px] h-auto block mx-auto"
        loading="eager"
      />
    </main>
  );
}
