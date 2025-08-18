import Image from 'next/image';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  isImage?: boolean;
}

export default function StatCard({ icon, label, value, isImage = false }: StatCardProps) {
  return (
    <div className="w-28 h-32 bg-white/90 rounded-2xl border border-gray-200 shadow-md px-3 py-4 flex flex-col items-center justify-between transition-all hover:shadow-lg active:scale-95">
      <div className="flex justify-center items-center h-8 w-8">
        {isImage ? (
          <Image src={icon} alt={label} width={28} height={28} />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 tracking-wide">{label}</p>
        <p className="text-base font-semibold text-secondary mt-0.5">{value}</p>
      </div>
    </div>
  );
}
