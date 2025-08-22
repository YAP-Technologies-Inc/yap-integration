'use client';

import React from 'react';
import { TablerVolume, MdiApproximatelyEqual, TablerClockFilled } from '@/icons';

export interface LessonScore {
  overall: number;
  accuracy: number;
  fluency: number;
  intonation: number;
  created_at?: string | number | Date;
}

export function useScoreSheet() {
  const [sheet, setSheet] = React.useState<{ title: string; score: LessonScore } | null>(null);

  const openWith = React.useCallback((title: string, score: LessonScore) => {
    setSheet({ title, score });
  }, []);

  const close = React.useCallback(() => setSheet(null), []);

  const node = (
    <ScoreSheet open={!!sheet} onClose={close}>
      {sheet && <ScoreContent score={sheet.score} />}
    </ScoreSheet>
  );

  return { sheet, openWith, close, node };
}

function ScoreSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[10000] bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed left-0 right-0 bottom-0 z-[10001] transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="mx-auto w-full sm:w-[560px] rounded-t-[28px] shadow-2xl"
          style={{ background: '#f0ebe1' }}
        >
          <div className="p-6 pb-7">{children}</div>
        </div>
      </div>
    </>
  );
}

export function ScoreContent({ score }: { score: LessonScore }) {
  const when = score.created_at
    ? new Date(score.created_at).toLocaleString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      })
    : null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-4xl font-extrabold text-secondary">Lesson Score</h4>
        <div className="text-4xl font-extrabold text-secondary">{Math.round(score.overall)}</div>
      </div>

      <div className="mt-4 divide-y divide-black/10">
        <MetricRow
          icon={<TablerVolume className="w-5 h-5" />}
          iconTint="text-[#e86b5a]"
          label="Pronunciation"
          value={score.accuracy}
        />
        <MetricRow
          icon={<TablerClockFilled className="w-5 h-5" />}
          iconTint="text-[#4285f4]"
          label="Speed"
          value={score.fluency}
        />
        <MetricRow
          icon={<MdiApproximatelyEqual className="w-5 h-5" />}
          iconTint="text-[#f4b400]"
          label="Similarity"
          value={score.intonation}
        />
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  iconTint,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconTint?: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={iconTint}>{icon}</span>
        <span className="text-secondary">{label}</span>
      </div>

      <span
        className={`w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center ${scoreBadge(value)}`}
      >
        {Math.round(value)}
      </span>
    </div>
  );
}

function scoreBadge(value: number) {
  const passingScore = 80;
  let color = 'bg-tertiary border-b-3 border-r-1 border-[#e4a92d]';
  if (value >= passingScore) color = 'bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]';
  else if (value < 60) color = 'bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]';

  if (value >= passingScore || (value >= 60 && value < passingScore)) {
    return `${color} text-[#141414]`;
  } else {
    return `${color} text-white`;
  }
}
