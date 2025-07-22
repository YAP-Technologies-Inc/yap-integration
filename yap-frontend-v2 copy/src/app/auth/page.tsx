'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AuthCard from '@/components/auth/AuthCard';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthLogo from '@/components/auth/AuthLogo';
import group from '@/assets/group.png';
import { setThemeColor, themeColors } from '@/utils/themeColor';

export default function AuthPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const [formType, setFormType] = useState<'signup' | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Track if user canceled login
  useEffect(() => {
    if (!authenticated && showModal) {
      const timeout = setTimeout(() => {
        setShowModal(false); // Restore AuthCard if modal was dismissed
      }, 5000); // adjust as needed

      return () => clearTimeout(timeout);
    }
  }, [authenticated, showModal]);

  useEffect(() => {
    if (authenticated && user) {
      setShowModal(false);
      setFormType('signup');
    }
  }, [authenticated, user]);

  useEffect(() => {
    if (formType === null) {
      setThemeColor(themeColors.secondary);
    } else {
      setThemeColor(themeColors.backgroundPrimary);
    }
  }, [formType]);

  if (!ready) return <div>Loading Privy...</div>;

  return (
    <div
      className={`min-h-screen w-screen ${
        formType === null ? 'bg-background-secondary' : 'bg-background-primary'
      } flex flex-col items-center justify-start transition-all duration-300 ease-in-out`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex-grow w-full flex items-end justify-center transition-all duration-300 ease-in-out">
        {formType === 'signup' && authenticated && <SignUpForm />}

        {!authenticated && !showModal && (
          <AuthCard
            onEmailClick={() => {
              setShowModal(true);
              setTimeout(() => login(), 100); // or shorter delay
            }}
          />
        )}

        {showModal && !authenticated && (
          <div className="text-secondary text-lg mb-10">
            Opening secure login...
          </div>
        )}
      </div>
    </div>
  );
}
