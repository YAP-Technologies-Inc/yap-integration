// SplashScreen.tsx
// This component displays a 3-slide onboarding splash screen
// and allows users to skip or proceed to the main app.
// It is used after the "Securing your account..." loader.
// And renders after the loader completes.

'use client';
import { useState } from 'react';
import cardImage from '@/assets/card.png';
import paperImage from '@/assets/paper.png';
import animalImage from '@/assets/animal.png';
import Image from 'next/image';
import YapIcon from '../layout/YapIcon';

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
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col">
      {/* Logo and Skip */}
      <div className="relative flex items-center justify-center">
        <div className="mt-2">
          <YapIcon />
        </div>
        <button
          onClick={onFinish}
          className="absolute right-0 top-2 text-sm text-secondary"
        >
          Skip
        </button>
      </div>

      {/* Image + Text + Next button */}
      <div className="flex flex-col items-center mt-12 px-4">
        <div className="w-full max-w-sm mb-4 h-[360px] flex items-center justify-center">
          <Image
            src={splashSlides[index].image}
            alt={`Splash ${index + 1}`}
            width={1000}
            height={900}
            className="max-h-full object-contain"
          />
        </div>

        <p className="text-2xl font-semibold text-secondary text-center max-w-xs mb-6">
          {splashSlides[index].text.toUpperCase()}
        </p>

        <button
          onClick={() => (isLastSlide ? onFinish() : setIndex(index + 1))}
          className="bg-secondary text-white py-3 px-6 rounded-full shadow-md w-full max-w-xs"
        >
          {isLastSlide ? 'Start' : 'Next'}
        </button>
      </div>
    </div>
  );
}
