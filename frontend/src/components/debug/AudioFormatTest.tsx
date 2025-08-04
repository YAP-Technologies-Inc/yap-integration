'use client';

import { useEffect, useState } from 'react';

export default function AudioFormatTest() {
  const [mimeType, setMimeType] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [error, setError] = useState('');
  const [blobSize, setBlobSize] = useState<number | null>(null);

  useEffect(() => {
    const detectAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          console.log('🎧 Recorded Blob:', blob);
          console.log('📦 Blob size:', blob.size, 'bytes');
          console.log('📎 MIME type:', blob.type);

          setMimeType(blob.type);
          setBlobSize(blob.size);
          setBlobUrl(URL.createObjectURL(blob));
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 3000); // record for 3 seconds
      } catch (err) {
        console.error('🎤 Mic error:', err);
        setError((err as Error).message || 'Failed to access microphone');
      }
    };

    detectAudio();
  }, []);

  return (
    <div className="mt-4 p-4 bg-white border rounded shadow-sm">
      <h2 className="font-semibold text-lg mb-2">🎙️ Audio Format Debug</h2>
      {error ? (
        <p className="text-red-600">❌ Error: {error}</p>
      ) : (
        <>
          <p className="mb-1">
            <strong>MIME Type:</strong> <code>{mimeType}</code>
          </p>
          <p className="mb-2">
            <strong>Blob Size:</strong> {blobSize !== null ? `${blobSize} bytes` : 'N/A'}
          </p>
          {blobUrl && (
            <audio controls src={blobUrl} className="w-full mt-2" />
          )}
        </>
      )}
    </div>
  );
}
