'use client';

import { useState } from 'react';
import { TablerChevronLeft } from '@/icons';
import SecuringLoader from '../loading/SecuringLoader';
import AuthLogo from '@/components/auth/AuthLogo';
import SelectLanguageForm from '@/components/auth/SelectLanguageForm';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

interface Props {
  onBack: () => void;
  onSwitch: () => void;
}

export default function SignUpForm({ onBack }: Props) {
  const { user } = usePrivy();
  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'language' | 'loading'>('signup');

  const [formData, setFormData] = useState({
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('language');
  };

  const handleFinalSubmit = async (language: string) => {
    setStep('loading');

    // const payload = {
    //   name: formData.name,
    //   language_to_learn: language,
    //   wallet_address: user?.wallet?.address,
    // };

  };

  if (step === 'loading') return <SecuringLoader />;
  if (step === 'language')
    return (
      <SelectLanguageForm
        onNext={() => {}}
        onBack={() => setStep('signup')}
        onSelect={handleFinalSubmit}
      />
    );

  return (
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col justify-start items-center">
      <button
        onClick={onBack}
        className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
      >
        <div className="mt-2">
          <TablerChevronLeft />
        </div>
      </button>

      <AuthLogo />

      <div className="mt-6 mb-4 text-center">
        <h2 className="text-2xl font-bold text-secondary">Create an account</h2>
        <p className="text-base text-secondary mt-1">What should we call you?</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
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
