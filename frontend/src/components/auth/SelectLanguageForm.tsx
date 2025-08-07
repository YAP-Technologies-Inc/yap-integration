"use client";

import { TablerChevronLeft } from "@/icons";
import AuthLogo from "@/components/auth/AuthLogo";
// Use a relative path string for images in the public directory
const languages = [{ name: "Spanish", flag: "/assets/spain.png" }];

interface Props {
  onNext: () => void;
  onBack: () => void;
  onSelect: (lang: string) => void;
}

export default function SelectLanguageForm({
  onNext,
  onBack,
  onSelect,
}: Props) {
  return (
    <div className="min-h-[100dvh] w-full bg-background-primary px-4 pb-safe pt-safe flex flex-col relative">
      <div className="relative flex items-center pt-4 mb-4">
        <button
          onClick={onBack}
          className="text-2xl font-semibold text-secondary hover:cursor-pointer lg:text-4xl absolute left-0"
          style={{ zIndex: 10 }}
        >
          <TablerChevronLeft />
        </button>
        <div className="w-full flex justify-center">
          <h2 className="text-sm font-semibold text-[#2D1C1C]">
        Select a language
          </h2>
        </div>
      </div>

      <div className="pt-4 mb-4 text-center">
        <p className="text-lg font-bold text-[#2D1C1C] mt-1">
          What language would you like to learn?
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm w-full mx-auto ">
        {languages.map(({ name, flag }) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className="w-full bg-white rounded-xl px-4 py-3 text-left text-[#2D1C1C] text-base font-medium border-b-3 border-[#e3ded3] flex items-center gap-3
            hover:cursor-pointer 
            "
          >
            <img
              src={flag}
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
