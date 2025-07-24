'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import AuthCard from '@/components/auth/AuthCard';
import SignUpForm from '@/components/auth/SignUpForm';

export default function AuthPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const router = useRouter();

  const [hideFooter, setHideFooter] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Detect Privy modal
  useEffect(() => {
    const MODAL_SELECTOR = '#headlessui-portal-root';
    let wasOpen = false;
    const observer = new MutationObserver(() => {
      const isOpen = Boolean(document.body.querySelector(MODAL_SELECTOR));
      if (isOpen !== wasOpen) {
        wasOpen = isOpen;
        setHideFooter(isOpen);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Check for profile, but don’t block LCP
  useEffect(() => {
    if (authenticated && user?.id) {
      setCheckingProfile(true);
      fetch(`http://localhost:4000/api/profile/${user.id}`)
        .then((res) => {
          if (res.ok) {
            setHasProfile(true);
            localStorage.setItem('userId', user.id);
          } else {
            setHasProfile(false);
          }
        })
        .catch(() => setHasProfile(false))
        .finally(() => setCheckingProfile(false));
    }
  }, [authenticated, user]);

  // Redirect to home once profile is confirmed
  useEffect(() => {
    if (authenticated && hasProfile) {
      router.push('/home');
    }
  }, [authenticated, hasProfile]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-secondary">
        <div className="animate-spin h-12 w-12 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Authenticated but no profile yet — show signup form
  if (authenticated && hasProfile === false && !checkingProfile) {
    return <SignUpForm />;
  }

  // Default state — render AuthCard even if still checking
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-secondary">
      <AuthCard
        hideFooter={hideFooter}
        onEmailClick={() => {
          setHideFooter(true);
          login();
        }}
      />
    </div>
  );
}
