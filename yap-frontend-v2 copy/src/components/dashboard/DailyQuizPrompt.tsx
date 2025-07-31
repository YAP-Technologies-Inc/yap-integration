'use client';
import coin from '../../assets/coin.png';
import { TablerLock } from '@/icons/Lock';
import { TablerCheck } from '@/icons/Check'; 

interface DailyQuizCardProps {
  isUnlocked: boolean;
  isCompleted: boolean;
}

export default function DailyQuizCard({
  isUnlocked,
  isCompleted,
}: DailyQuizCardProps) {
  const isLocked = !isUnlocked;
  const isDone = isCompleted;
  const isActive = !isLocked && !isDone;

  const bgClass = isLocked
    ? 'bg-gray-300 text-gray-500'
    : isDone
    ? 'bg-green-100 text-green-800'
    : 'bg-white text-[#2D1C1C]';

  const badgeStyle =
    isLocked || isDone
      ? 'bg-gray-200 text-gray-400 border-gray-400'
      : 'bg-white text-black border';

  const iconOpacity = isLocked || isDone ? 'opacity-50' : '';

  const overlayIcon = isLocked ? (
    <TablerLock className="w-10 h-10 text-gray-600" />
  ) : isDone ? (
    <TablerCheck className="w-10 h-10 text-green-500" />
  ) : null;

  return (
    <div
      className={`relative rounded-2xl px-6 py-4 shadow-md w-full ${bgClass} py-6`}
    >
      {(isLocked || isDone) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {overlayIcon}
        </div>
      )}

      <div className={isActive ? '' : 'opacity-40 pointer-events-none'}>
        <h3 className="text-lg font-semibold mb-2">Daily Quiz</h3>

        {/* <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 ${iconOpacity}`}>
            <img src={coin.src} alt="Reward" className="w-5 h-5" />
            <span className="text-sm font-medium">+1 $YAP</span>
          </div>
          <div className={`flex items-center gap-2 ${iconOpacity}`}>
            <div className="w-5 h-5 rounded-full border-4 border-red-500 border-t-transparent animate-spin-slow"></div>
            <span className="text-sm font-medium">2/3 attempts left</span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
