'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AuthCard from '@/components/auth/AuthCard';
import SignUpForm from '@/components/auth/SignUpForm';
import { setThemeColor, themeColors } from '@/utils/themeColor';

export default function AuthPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const [formType, setFormType] = useState<'signup' | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Attempt at trying to hid our auth card but we need a way to make it look cooler and sleeker
  // As well as secure :)
  useEffect(() => {
    if (!authenticated && showModal) {
      const timeout = setTimeout(() => {
        setShowModal(false); 
      }, 5000); 

      return () => clearTimeout(timeout);
    }
  }, [authenticated, showModal]);

  useEffect(() => {
    if (authenticated && user) {
      setShowModal(false);
      setFormType('signup');
    }
  }, [authenticated, user]);

  // Set theme color based on form type for mobile
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

        {/* need to configure this as well  */}
        {!authenticated && !showModal && (
          <AuthCard
            onEmailClick={() => {
              setShowModal(true);
              setTimeout(() => login(), 100); 
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
