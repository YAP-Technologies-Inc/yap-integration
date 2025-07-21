'use client';

import { useRouter } from 'next/navigation';
import Vector from '@/assets/Vector.png';
import { TablerX } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';

export default function CheckEmail() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col justify-start items-center">
      {/* X button to exit */}
      <button
        onClick={() => router.push('/auth')}
        className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
      >
        <div className="mt-2">
          <TablerX />
        </div>
      </button>

      <AuthLogo />

      {/* Title + illustration */}
      <div className="mt-20 mb-6 w-20 h-20">
        <img
          src={Vector.src}
          alt="Check Email"
          className="w-full h-full object-contain"
        />
      </div>

      <h2 className="text-2xl font-bold text-secondary mb-2">Check your email</h2>
      <p className="text-base text-secondary text-center max-w-xs">
        If there is an email associated with that account, you’ll receive instructions to reset your password.
      </p>
    </div>
  );
}
