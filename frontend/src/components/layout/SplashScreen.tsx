'use client';
import { useState } from 'react';
import cardImage from '@/assets/card.png';
import paperImage from '@/assets/paper.png';
import animalImage from '@/assets/animal.png';
import AuthLogo from '../auth/AuthLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

const splashSlides = [
  {
    image: cardImage,
    text: 'Speak daily and earn $YAP.',
  },
  {
    image: paperImage,
    text: 'Get instant feedback',
  },
  {
    image: animalImage,
    text: 'Keep your streak',
  },
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [index, setIndex] = useState(0);
  const isLastSlide = index === splashSlides.length - 1;

  return (
    <div className="min-h-[100dvh] w-full bg-background-primary px-4 flex flex-col pb-2">
      {/* Logo and Skip */}
      <div className="relative flex items-center justify-center mt-2">
        <AuthLogo variant='red' />
        <button
          onClick={onFinish}
          className="absolute right-0 top-0 text-sm text-secondary hover:cursor-pointer
          lg:right-8 lg:top-2 lg:text-xl
          "
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div
        className="flex flex-col items-center mt-12 px-4
      lg:pt-36
      "
      >
        <div className="w-full max-w-sm mb-4 h-[360px] flex items-center justify-center">
          <img
            src="/assets/coin.png"
            alt={`Splash ${index + 1}`}
            className="max-h-full object-contain"
          />
        </div>

        <p className="text-2xl font-semibold text-secondary text-center max-w-xs mb-6">
          {splashSlides[index].text.toUpperCase()}
        </p>
      </div>

      <div
        className="w-full px-4 mt-auto flex justify-center *:
        lg:pb-20  
      "
      >
        <button
          onClick={() => (isLastSlide ? onFinish() : setIndex(index + 1))}
          className="bg-secondary text-white py-3 px-6 rounded-full shadow-md w-full max-w-xs hover:cursor-pointer">
          {isLastSlide ? 'Start' : 'Next'}
        </button>
      </div>
    </div>
  );
}
