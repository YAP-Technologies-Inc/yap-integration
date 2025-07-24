'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import SelectLanguageForm from '@/components/auth/SelectLanguageForm';
import SecuringLoader from '../loading/SecuringLoader';
import AuthLogo from '@/components/auth/AuthLogo';
import { useToast } from '../ui/ToastProvider';

export default function SignUpForm() {
  const {pushToast} = useToast();
  const { user } = usePrivy();
  const router = useRouter();

  const [step, setStep] = useState<'signup' | 'language' | 'loading'>('signup');
  const [name, setName] = useState('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      setStep('language'); 
    }
  };


  //Handles final submission after language selection
  // This will save the user profile and redirect to the home page
  // It will also set the userId in localStorage for future use
  // This is the last step in the signup process
  // Need this to be secure and handle errors properly
  // TODO: if user already exists, we should redirect them to the home page instead of asking for name again
  const handleFinalSubmit = async (language: string) => {
    setStep('loading');
  
    const payload = {
      user_id: user?.id,
      name,
      language_to_learn: language,
    };
  
    try {
      const res = await fetch(`http://localhost:4000/api/auth/secure-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save user');
      }
  
      localStorage.setItem('userId', data.user_id);

    } catch (err) {
      console.error('Failed to save user:', err);
      pushToast('Something went wrong. Please try again.', 'error');
      setStep('language'); 
    }
  };
  
  if (step === 'loading') return <SecuringLoader />;

  if (step === 'language') {
    return (
      <SelectLanguageForm
        onNext={() => {}}
        onBack={() => {}}
        onSelect={handleFinalSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-background-primary px-6 flex flex-col justify-start items-center">
      <AuthLogo />

      <div className="mt-6 mb-4 text-center">
        <h2 className="text-2xl font-bold text-secondary">Create an account</h2>
        <p className="text-base text-secondary mt-1">What should we call you?</p>
      </div>

      <form onSubmit={handleNameSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white shadow-sm border border-gray-200 placeholder-[#A59C9C] text-secondary outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md mt-2 mb-2"
        >
          Next
        </button>
      </form>
    </div>
  );
}
