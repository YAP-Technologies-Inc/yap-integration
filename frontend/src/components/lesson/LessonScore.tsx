'use client';

import React from 'react';
import { TablerVolume, MdiApproximatelyEqual, TablerClockFilled } from '@/icons';

/** Shared type for lesson/quiz scores */
export interface LessonScore {
  overall: number;
  accuracy: number;   // Pronunciation
  fluency: number;    // Speed
  intonation: number; // Similarity
  created_at?: string | number | Date;
}

/** Small controller hook so callers don’t manage popup state themselves */
export function useScoreSheet() {
  const [sheet, setSheet] = React.useState<{ title: string; score: LessonScore } | null>(null);

  const openWith = React.useCallback((title: string, score: LessonScore) => {
    setSheet({ title, score });
  }, []);

  const close = React.useCallback(() => setSheet(null), []);

  const node = (
    <ScoreSheet open={!!sheet} onClose={close}>
      {sheet && <ScoreContent title={sheet.title} score={sheet.score} />}
    </ScoreSheet>
  );

  return { sheet, openWith, close, node };
}

/** Presentational: dim background + slide-up panel (warm cream, no “notch”) */
function ScoreSheet({ open, onClose, children }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[10000] bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      {/* Slide-up panel */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[10001] transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="mx-auto w-full sm:w-[560px] rounded-t-[28px] shadow-2xl"
          style={{ background: '#f0ebe1' }} /* warm cream */
        >
          <div className="p-6 pb-7">{children}</div>
        </div>
      </div>
    </>
  );
}

/** Presentational: content inside the sheet */
export function ScoreContent({ title = 'Lesson Score', score }: { title?: string; score: LessonScore }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-[22px] font-extrabold text-secondary">{title}</h4>
        <div className="text-[34px] font-extrabold text-secondary">{Math.round(score.overall)}</div>
      </div>

      {/* Metrics */}
      <div className="mt-4 divide-y divide-black/10 rounded-2xl border border-black/10">
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

      {score.created_at && (
        <p className="mt-3 text-xs text-secondary/60">
          Last attempt: {new Date(score.created_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function MetricRow({
  icon, iconTint, label, value,
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
      <span className={`w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center ${badge(value)}`}>
        {Math.round(value)}
      </span>
    </div>
  );
}

function badge(v: number) {
  if (v >= 85) return 'bg-green-500/15 text-green-700';
  if (v >= 70) return 'bg-yellow-500/20 text-yellow-700';
  return 'bg-red-500/15 text-red-700';
}
