// SecuringLoader.tsx
// This component displays a loader while securing the user's account.
// TODO: This is onyl a placeholder for now, we will need to implement the actual logic later.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '../../components/layout/SplashScreen';
import './SecuringLoader.css';
import { useSnackbar } from '../ui/SnackBar';

export default function SecuringLoader() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const { showSnackbar } = useSnackbar();
  const snackbarShownRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show snackbar only when splash screen appears, and only once
  useEffect(() => {
    if (showSplash && !snackbarShownRef.current) {
      showSnackbar({
        message: 'Your wallet is ready!',
        variant: 'custom',
        duration: 3000,
      });
      snackbarShownRef.current = true;
    }
  }, [showSplash, showSnackbar]);

  const handleFinishSplash = () => {
    router.push('/home');
  };

  if (showSplash) return <SplashScreen onFinish={handleFinishSplash} />;

  return (
    <div className="loader-screen bg-background-primary">
      <div className="loader-container"></div>
      <p className="loader-message mt-4 font-normal pb-8">Securing your account...</p>
    </div>
  );
}
