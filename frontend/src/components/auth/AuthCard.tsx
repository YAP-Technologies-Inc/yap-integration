'use client';

import { TablerChevronRight } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';
import group from '@/assets/group.webp';
import Image from 'next/image';

interface AuthCardProps {
  onEmailClick: () => void;
  hideFooter?: boolean;
}

export default function AuthCard({
  onEmailClick,
  hideFooter = false,
}: AuthCardProps) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background-secondary justify-start bg-quaternary overflow-hidden">
      <AuthLogo />

      <div className="w-full max-w-md pt-20 px-6 overflow-hidden
        lg:pt-48 lg:max-w-xl
        
        ">
        <Image
          src={group}
          alt="Group"
          className=""
          width={320}
          height={240}
          priority
          placeholder="blur"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            contentVisibility: 'auto',
          }}
        />
      </div>

      <div
        className={[
          'w-full px-6 pb-2 rounded-t-3xl mt-auto sm:max-w-md',
          'transform transition-transform duration-300 ease-in-out',
          hideFooter ? 'translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-center h-full
        lg: pb-20 

        ">
          <button
            onClick={onEmailClick}
            className="w-full  bg-background-primary text-secondary font-semibold py-4 rounded-full shadow-md flex items-center justify-center gap-2 text-lg
            hover: cursor-pointer
            lg:
            ">
            Sign in 
          </button>
        </div>
      </div>
    </div>
  );
}
