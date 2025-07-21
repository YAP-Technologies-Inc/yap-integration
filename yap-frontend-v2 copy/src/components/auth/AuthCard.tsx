// AuthCard.tsx
'use client';

import { useLogin } from '@privy-io/react-auth';
import { TablerChevronRight } from '@/icons';
import group from '@/assets/group.png';
import AuthLogo from '@/components/auth/AuthLogo';

interface AuthCardProps {
  onEmailClick: () => void;
  onSwitch: () => void;
}

export default function AuthCard({ onEmailClick, onSwitch }: AuthCardProps) {
  const { login } = useLogin();


  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-start bg-quaternary">
      <AuthLogo />

      {/* Group Image */}
      <div className="w-full max-w-md pt-18 px-6 overflow-hidden">
        <img
          src={group.src}
          alt="Group"
          className="w-full max-w-full object-cover rounded-xl"
        />
      </div>

      {/* Auth Card */}
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

          {/* Single Login Button */}
          <button
            onClick={login}
            className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md mt-2 mb-2 flex items-center justify-center gap-2"
          >
            Continue with Privy
            <TablerChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-sm mt-8 text-[#5C4B4B]">
          Already have an account?{' '}
          <span className="underline cursor-pointer" onClick={onSwitch}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
