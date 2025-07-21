// This compoent renders a stat card that displays an icon, label, and value.
// For the profile page

import Image from 'next/image';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  isImage?: boolean;
}

export default function StatCard({
  icon,
  label,
  value,
  isImage = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl px-4 py-5 w-28 text-center shadow-md flex flex-col justify-between h-32">
      <div className="flex justify-center items-center">
        {isImage ? (
          <Image src={icon} alt={label} width={28} height={28} />
        ) : (
          <span className="text-xl">{icon}</span>
        )}
      </div>
      <div>
        <p className="text-xs text-secondary leading-tight">{label}</p>
        <p className="text-base font-bold text-secondary mt-1">{value}</p>
      </div>
    </div>
  );
}
