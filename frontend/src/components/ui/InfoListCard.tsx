// This renders a list of information items as clickable cards.
import { TablerChevronRight } from '@/icons';

interface InfoItem {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

interface InfoListCardProps {
  items: InfoItem[];
}

export default function InfoListCard({ items }: InfoListCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">
      {items.map((item, index) => (
        <div
          key={index}
          onClick={item.onClick}
          className="flex items-center justify-between px-4 py-3 bg-white border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="text-lg text-black">{item.icon}</div>
            <span className="text-sm font-medium text-secondary">
              {item.label}
            </span>
          </div>
          <TablerChevronRight className="text-[#A59C9C]" />
        </div>
      ))}
    </div>
  );
}
