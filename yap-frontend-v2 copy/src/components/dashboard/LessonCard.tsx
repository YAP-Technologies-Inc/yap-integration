// This component renders a card for each lesson in the dashboard.
// It displays the lesson title, description, and status (completed, locked, or available).
// Clicking on an available lesson navigates to the lesson page.
'use client';

import { useRouter } from 'next/navigation';
import { TablerCheck } from '@/icons';

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'locked' | 'available';
}

export default function LessonCard({
  title,
  description,
  status,
  id,
}: LessonCardProps) {
  const router = useRouter();

  const baseClasses =
    'relative rounded-2xl px-4 py-6 shadow-md w-40 h-32 flex-shrink-0 flex flex-col justify-center items-center text-center transition-transform';
  const statusClasses =
    status === 'completed'
      ? 'bg-red-500 border-b-2 border-red-700 text-white'
      : status === 'locked'
      ? 'bg-gray-200 border-b-2 border-gray-400 text-gray-500 cursor-not-allowed'
      : 'bg-white border-b-2 border-gray-300 text-[#2D1C1C] cursor-pointer hover:scale-[1.02]';

  const handleClick = () => {
    if (status === 'available') {
      router.push(`/lesson/${id}`);
    }
  };

  return (
    <div onClick={handleClick} className={`${baseClasses} ${statusClasses}`}>
      {status === 'completed' && (
        <TablerCheck className="absolute top-2 left-2 w-5 h-5 text-white" />
      )}
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}
