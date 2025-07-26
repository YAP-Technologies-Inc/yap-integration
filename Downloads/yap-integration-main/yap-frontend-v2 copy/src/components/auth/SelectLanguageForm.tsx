'use client';

import { TablerChevronLeft } from '@/icons';
import AuthLogo from '@/components/auth/AuthLogo';
import spanishFlag from '@/assets/flags/spanishFlag.png';

const languages = [{ name: 'Spanish', flag: spanishFlag }];

interface Props {
  onNext: () => void;
  onBack: () => void;
  onSelect: (lang: string) => void;
}

export default function SelectLanguageForm({ onNext, onBack, onSelect }: Props) {
  return (
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col">
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
        <h2 className="text-sm font-semibold text-[#2D1C1C]">Select a language</h2>
        <p className="text-lg font-bold text-[#2D1C1C] mt-1">
          What language would you like to learn?
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm w-full mx-auto">
        {languages.map(({ name, flag }) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className="w-full bg-white rounded-xl px-4 py-3 text-left text-[#2D1C1C] text-base font-medium shadow-sm border border-gray-200 flex items-center gap-3"
          >
            <img
              src={flag.src}
              alt={`${name} flag`}
              className="w-6 h-4 rounded-sm object-cover"
            />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
