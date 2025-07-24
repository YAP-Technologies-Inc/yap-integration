// src/components/cards/GrammarCard.tsx
'use client';

interface GrammarCardProps {
  rule: string;
  examples: string[];
}

export function GrammarCard({ rule, examples }: GrammarCardProps) {
  return (
    <div className="relative w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-secondary mb-4">{rule}</h2>
      <ul className="space-y-2 flex-1 overflow-auto">
        {examples.map((ex, i) => (
          <li
            key={i}
            className="bg-gray-100 rounded-lg p-3 text-secondary text-sm"
          >
            {ex}
          </li>
        ))}
      </ul>
    </div>
  );
}
