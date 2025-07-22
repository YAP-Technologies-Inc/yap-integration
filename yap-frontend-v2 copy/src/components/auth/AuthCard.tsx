'use client';

import { TablerChevronRight } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';
import group from '@/assets/group.png';

interface AuthCardProps {
  onEmailClick: () => void;
}

export default function AuthCard({ onEmailClick }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-start bg-quaternary">
      {/* Logo */}
      <AuthLogo />

      {/* Group Image */}
      <div className="w-full max-w-md pt-6 px-6 overflow-hidden">
        <img
          src={group.src}
          alt="Group"
          className="w-full max-w-full object-cover rounded-xl"
        />
      </div>

      {/* Auth Card (bottom panel) */}
      <div
        className="bg-background-primary w-full px-6 py-10 rounded-t-3xl shadow-lg
                   sm:max-w-md sm:px-8 sm:py-12
                   lg:max-w-lg xl:max-w-xl
                   flex flex-col items-center justify-center h-auto min-h-[43vh] mt-auto"
      >
        <div className="w-full">
          <h1 className="text-2xl font-bold text-center text-[#2D1C1C] mb-2">
            Welcome to Yap
          </h1>
          <p className="text-sm text-center text-[#5C4B4B] mb-6">
            The only app that pays you to practice languages.
          </p>

          {/* Continue with Privy button */}
          <button
            onClick={onEmailClick}
            className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md mt-2 mb-2 flex items-center justify-center gap-2"
          >
            Continue with Privy
            <TablerChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
