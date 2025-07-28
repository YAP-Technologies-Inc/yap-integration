'use client';
import AudioFormatTest from '@/components/debug/AudioFormatTest';

export default function AudioTestPage() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎙️ Audio Test</h1>
      <AudioFormatTest />
    </div>
  );
}
