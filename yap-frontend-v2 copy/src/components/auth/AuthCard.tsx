'use client';

import { TablerChevronRight } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';
import group from '@/assets/group.png';

interface AuthCardProps {
  onEmailClick: () => void;
  hideFooter?: boolean;
}

export default function AuthCard({
  onEmailClick,
  hideFooter = false,
}: AuthCardProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-quaternary">
      {/* Logo */}
      <AuthLogo />

      {/* Group image */}
      <div className="w-full max-w-md pt-6 px-6 overflow-hidden">
        <img
          src={group.src}
          alt="Group"
          className="w-full object-cover rounded-xl"
        />
      </div>

      {/* Footer panel: slide up when hideFooter */}
      <div
        className={[
          'bg-background-primary w-full px-6 h-[37vh] rounded-t-3xl shadow-lg mt-auto sm:max-w-md',
          'transform transition-transform duration-300 ease-in-out',
          hideFooter ? 'translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        <h1 className="text-2xl font-bold text-center text-[#2D1C1C] mb-2">
          Welcome to Yap
        </h1>
        <p className="text-sm text-center text-[#5C4B4B] mb-6">
          The only app that pays you to practice languages.
        </p>
        <button
          onClick={onEmailClick}
          className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md flex items-center justify-center gap-2"
        >
          Continue with Privy
          <TablerChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
