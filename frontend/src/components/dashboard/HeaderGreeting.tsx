'use client';

import { useUserContext } from '@/context/UserContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function HeaderGreeting() {
  const { userId } = useUserContext();
  const { name, isLoading, isError } = useUserProfile(userId);

  //During load just show a skeleton
  if (isLoading) {
    return (
      <div className="flex items-center w-full p-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-300 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    // Fallback if profile fetch failed
    return (
      <div className="flex items-center w-full p-4">
        <span className="text-red-500">Failed to load profile.</span>
      </div>
    );
  }

  // const firstInitial = name.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center justify-start w-full lg:py-4 py-2">
      {/* <div className="w-12 h-12 bg-background-secondary rounded-full mr-3 flex items-center justify-center">
        <span className="text-white text-lg font-semibold">
          {firstInitial}
        </span>
      </div> */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-secondary leading-tight">
          Welcome {name}
        </h1>
        <p className="text-sm text-[#5C4B4B] leading-snug">
          Hola, ¿cómo estás hoy?
        </p>
      </div>
    </div>
  );
}
