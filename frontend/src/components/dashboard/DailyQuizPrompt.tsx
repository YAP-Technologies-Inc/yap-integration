'use client';
import { useEffect, useState } from 'react';
import { TablerLock } from '@/icons/Lock';
import { TablerCheck } from '@/icons/Check';
import {
  getTodayAttemptsLeft,
  getTodayLastAttemptAvg,
  getTodayCompleted,
} from '@/utils/dailyQuizStorage';

interface DailyQuizCardProps {
  isUnlocked: boolean;
  // You can still pass these as fallbacks; the card will override from storage on mount.
  isCompleted?: boolean;
  attemptsLeft?: number;
  lastAttemptAvg?: number;
}

export default function DailyQuizCard({
  isUnlocked,
  isCompleted: propCompleted = false,
  attemptsLeft: propAttemptsLeft = 3,
  lastAttemptAvg: propLastAttemptAvg = 0,
}: DailyQuizCardProps) {
  const [attemptsLeft, setAttemptsLeft] = useState(propAttemptsLeft);
  const [lastAttemptAvg, setLastAttemptAvg] = useState(propLastAttemptAvg);
  const [isDone, setIsDone] = useState(propCompleted);

  useEffect(() => {
    // Read today's data from the same date-scoped key used by the quiz
    setAttemptsLeft(getTodayAttemptsLeft());
    setLastAttemptAvg(getTodayLastAttemptAvg());
    setIsDone(getTodayCompleted());
  }, []);

  const isLocked = !isUnlocked || attemptsLeft <= 0;
  const isActive = !isLocked && !isDone;

  const bgClass = isLocked
    ? 'bg-gray-300 text-gray-500'
    : isDone
    ? 'bg-green-100 text-green-800 border-b-3 border-r-1 border-green-200'
    : 'bg-white text-[#2D1C1C]';

  const overlayIcon = isLocked ? (
    <TablerLock className="w-10 h-10 text-gray-600" />
  ) : isDone ? (
    <TablerCheck className="w-10 h-10 text-green-500" />
  ) : null;

  // Only show the "previous attempt" (lastAttemptAvg)
  const percent = Math.min(Math.round(lastAttemptAvg || 0), 100);

  return (
    <div className={`relative rounded-xl py-7 border-b-3 border-r-1 border-[#e3ded3] w-full max-w-sm mx-auto ${bgClass} transition-all duration-300`}>
      {(isLocked || isDone) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {overlayIcon}
        </div>
      )}

      {/* Keep vertical padding consistent for all states */}
      <div className="py-7">
        {/* Show progress + attempts only if not completed (not green) */}
        {!isDone && (
          <div className={isActive ? '' : 'opacity-40 pointer-events-none'}>
            <div className="flex items-center justify-center gap-4 mb-2">
              <svg width={38} height={38} viewBox="0 0 48 48">
                <circle cx={24} cy={24} r={20} fill="none" stroke="#E5E7EB" strokeWidth={4} />
                <circle
                  cx={24}
                  cy={24}
                  r={20}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth={4}
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - percent / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fill="#2D1C1C"
                  fontWeight="bold"
                >
                  {percent}%
                </text>
              </svg>
              <span className="text-sm font-semibold text-secondary">
                {attemptsLeft}/3 attempts left
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
