// components/ReportIssue.tsx
import { TablerX } from '@/icons';

interface ReportIssueProps {
  onClose: () => void;
}

export function ReportIssue({ onClose }: ReportIssueProps) {
  return (
    // backdrop
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* modal */}
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-secondary transition-colors"
        >
          <TablerX className="w-6 h-6 text-secondary" />
        </button>
        <div className="p-6 text-center">
          <h1 className="text-xl font-semibold text-secondary">Report an Issue</h1>
          {/* … your form or content here … */}
        </div>
      </div>
    </div>
  );
}
