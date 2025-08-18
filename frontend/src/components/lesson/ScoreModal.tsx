import React, { useEffect, useRef, useState } from 'react';

interface ScoreModalProps {
  onClose: () => void;
  scoreType: 'Accuracy' | 'Fluency' | 'Intonation';
  value: number;
  text: string;
  transcript?: string;
  specificIssues?: string[];
}

function getScoreColor(_: string, value: number) {
  if (value >= 80) return 'bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]';
  if (value < 60) return 'bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]';
  return 'bg-tertiary border-b-3 border-r-1 border-[#e4a92d]';
}

export function ScoreModal({
  onClose,
  scoreType,
  value,
  text,
  // transcript,
  specificIssues = [],
}: ScoreModalProps) {
  const color = getScoreColor(scoreType, value);
  const [closing, setClosing] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //closes with animation first
  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    tRef.current = setTimeout(() => {
      onClose();
    }, 320);
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-end justify-center
        ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      // keep the tint in CSS so fade anim is visible
    >
      {/* Backdrop via pseudo-elem */}
      <div className="absolute inset-0" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-background-primary w-full max-w-md min-h-[30dvh]
          flex flex-col justify-start pt-3 px-5 pb-5 rounded-t-3xl shadow-lg
          will-change-transform
          ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="text-xs font-semibold text-secondary mb-1">{scoreType}</div>
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full
            text-[#141414] text-2xl font-bold mb-2 ${color}`}
          >
            {Math.round(value)}
          </div>
        </div>

        <div className="text-base text-secondary mb-2 text-center">{text}</div>

        {specificIssues.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-semibold text-gray-500 mb-1">Details:</div>
            <ul className="list-disc list-inside text-xs text-gray-700">
              {specificIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .animate-slide-up { animation: slideUp 0.3s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-fade-out { animation: fadeOut 0.3s ease forwards; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
