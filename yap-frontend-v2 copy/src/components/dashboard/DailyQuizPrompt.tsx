// DailyQuizPrompt.tsx
// This component renders the daily quiz prompt card in the dashboard.
// It displays the quiz title, description, and a list of words to use.
// The card is styled based on whether the quiz is unlocked or not.

"use client";
import coin from "../../assets/coin.png";
import { TablerLock } from "@/icons/Lock";

interface DailyQuizCardProps {
  isUnlocked: boolean;
}

export default function DailyQuizCard({ isUnlocked }: DailyQuizCardProps) {
  const bgClass = isUnlocked
    ? "bg-white text-[#2D1C1C]"
    : "bg-gray-300 text-gray-500";

  const badgeStyle = isUnlocked
    ? "bg-white text-black border"
    : "bg-gray-200 text-gray-400 border-gray-400";

  const iconOpacity = isUnlocked ? "" : "opacity-50";

  return (
    <div
      className={`relative rounded-2xl px-6 py-4 shadow-md w-full ${bgClass}`}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <TablerLock className="w-10 h-10 text-gray-600" />
        </div>
      )}

      <div className={isUnlocked ? "" : "opacity-40 pointer-events-none"}>
        <h3 className="text-lg font-semibold mb-2">Daily Quiz</h3>
        <p className="text-sm mb-3">Use 3 new words in a sentence</p>

        <div className="flex gap-2 flex-wrap mb-4">
          <span
            className={`text-sm px-3 py-1 rounded-full border ${badgeStyle}`}
          >
            schedule
          </span>
          <span
            className={`text-sm px-3 py-1 rounded-full border ${badgeStyle}`}
          >
            entrepreneur
          </span>
          <span
            className={`text-sm px-3 py-1 rounded-full border ${badgeStyle}`}
          >
            rural
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 ${iconOpacity}`}>
            <img src={coin.src} alt="Reward" className="w-5 h-5" />
            <span className="text-sm font-medium">+10 $YAP</span>
          </div>

          <div className={`flex items-center gap-2 ${iconOpacity}`}>
            <div className="w-5 h-5 rounded-full border-4 border-red-500 border-t-transparent animate-spin-slow"></div>
            <span className="text-sm font-medium">2/3 attempts left</span>
          </div>
        </div>
      </div>
    </div>
  );
}