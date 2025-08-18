'use client';
import { TablerLock } from '@/icons/Lock';
import { TablerCheck } from '@/icons/Check';

interface DailyQuizCardProps {
  isUnlocked: boolean;
  isCompleted: boolean;
  attemptsLeft: number; // 0..3
  lastAttemptAvg: number; // 0..100 (last finished attempt for today)
}

export default function DailyQuizCard({
  isUnlocked,
  isCompleted,
  attemptsLeft,
  lastAttemptAvg,
}: DailyQuizCardProps) {
  // Priorities: completed > locked > active
  const isLocked = !isUnlocked || attemptsLeft <= 0;
  const percent = Math.min(Math.max(Math.round(lastAttemptAvg || 0), 0), 100);

  const bgClass = isCompleted
    ? 'bg-green-100 text-green-800 border-b-3 border-r-1 border-green-200'
    : isLocked
      ? 'bg-gray-300 text-gray-600'
      : 'bg-white text-[#2D1C1C]';

  const overlayIcon = isCompleted ? (
    <TablerCheck className="w-10 h-10 text-green-500" />
  ) : isLocked ? (
    <TablerLock className="w-10 h-10 text-gray-600" />
  ) : null;

  const showProgress = !isCompleted && !isLocked;

  return (
    <div
      className={`relative rounded-xl py-7 border-b-3 border-r-1 border-[#e3ded3] w-full max-w-full mx-auto ${bgClass} transition-all duration-300
      `}
    >
      {(isCompleted || isLocked) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">{overlayIcon}</div>
      )}

      {/* keep height stable */}
      <div className="py-7">
        {showProgress && (
          <div className="flex items-center justify-center gap-4 mb-2">
            <svg width={38} height={38} viewBox="0 0 48 48" aria-hidden="true">
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
        )}
      </div>
    </div>
  );
}
