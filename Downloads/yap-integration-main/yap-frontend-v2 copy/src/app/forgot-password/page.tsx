// TODO: Have this route back to the login page if user goes back 
// But since we have auth page render formtypes it needs to be handled in the auth page
'use client';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { TablerChevronLeft } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';
import CheckEmail from '@/components/auth/CheckEmail';

interface Props {
  onBack: () => void;
}

export default function ForgotPasswordPage({  }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setSubmitted(true);
  };

  if (submitted) return <CheckEmail />;

  return (
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col justify-start items-center">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
      >
        <div className="mt-2">
          <TablerChevronLeft />
        </div>
      </button>

      <AuthLogo />

      {/* Title + subtitle */}
      <div className="mt-6 mb-4 text-center">
        <h2 className="text-2xl font-bold text-secondary">Forgot Password</h2>
        <p className="text-base text-secondary mt-1">
          Enter the email associated with your account.
        </p>
      </div>

      {/* Email form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
        id="forgot-form"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white shadow-sm border border-gray-200 placeholder-[#A59C9C] text-secondary outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md mt-4"
        >
          Next
        </button>
      </form>
    </div>
  );
}
