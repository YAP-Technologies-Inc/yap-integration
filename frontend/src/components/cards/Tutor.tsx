'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TablerMicrophone,
  TablerSend2,
  TablerPlay,
  TablerPlayerPauseFilled,
  TablerX,
} from '@/icons';
import { useSnackbar } from '@/components/ui/SnackBar';

interface TutorProps {
  sendMessage: (message: string) => Promise<void>;
  onUserMessage: (text: string) => void;
  onUserAudio: (audioUrl: string) => void;
  userName?: string;
}

const pickMime = () => {
  const candidates = [
    'audio/mp4',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const t of candidates) {
    // @ts-ignore
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return '';
};

const formatTime = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Tutor({
  sendMessage,
  onUserMessage,
  onUserAudio,
  userName = 'User',
}: TutorProps) {
  const { showSnackbar } = useSnackbar();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // staged audio chip
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [pendingAudioBlob, setPendingAudioBlob] = useState<Blob | null>(null);
  const [pendingMime, setPendingMime] = useState<string | null>(null);

  // audio chip playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currTime, setCurrTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // mic lifecycle
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const hardKillMicrophone = async () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    mediaStreamRef.current = null;
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      hardKillMicrophone();
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) hardKillMicrophone();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => setDuration(el.duration || 0);
    const onTime = () => setCurrTime(el.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrTime(0);
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
    };
  }, [pendingAudioUrl]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {}
    }
  };

  const clearPendingAudio = () => {
    audioRef.current?.pause?.();
    if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    setPendingAudioUrl(null);
    setPendingAudioBlob(null);
    setPendingMime(null);
    setIsPlaying(false);
    setCurrTime(0);
    setDuration(0);
  };

  const handleRecord = async () => {
    if (isRecording) {
      await hardKillMicrophone();
      return;
    }
    if (pendingAudioUrl) clearPendingAudio();

    try {
      await hardKillMicrophone();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = pickMime();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      recordedChunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) recordedChunks.current.push(e.data);
      };

      mr.onstop = () => {
        const blobType = mr.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunks.current, { type: blobType });
        recordedChunks.current = [];

        const localUrl = URL.createObjectURL(blob);
        setPendingAudioUrl(localUrl);
        setPendingAudioBlob(blob);
        setPendingMime(blob.type || 'audio/webm');
      };

      mr.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mr.state === 'recording') {
          mr.stop();
          setIsRecording(false);
        }
      }, 15000);
    } catch (err) {
      console.error('Recording error:', err);
      showSnackbar({
        message: 'Mic permission denied or not available.',
        variant: 'error',
        duration: 3000,
      });
      await hardKillMicrophone();
    }
  };

  const handleSend = async () => {
    // audio → transcribe → send text
    if (pendingAudioBlob && pendingAudioUrl) {
      onUserAudio(pendingAudioUrl);
      try {
        const fd = new FormData();
        const mime = pendingMime || pendingAudioBlob.type || 'audio/webm';
        const ext = mime.includes('mp3')
          ? 'mp3'
          : mime.includes('mp4')
            ? 'mp4'
            : mime.includes('m4a')
              ? 'm4a'
              : mime.includes('ogg')
                ? 'ogg'
                : 'webm';
        fd.append('audio', pendingAudioBlob, `recording.${ext}`);

        const res = await fetch(`${API_URL}/api/transcribe`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`Transcribe failed (${res.status})`);
        const data = await res.json();
        const transcript = (data?.text ?? data?.transcript ?? '').trim();
        if (transcript) {
          await sendMessage(transcript);
        } else {
          showSnackbar({ message: 'No transcript detected.', variant: 'error', duration: 2500 });
        }
      } catch (err) {
        console.error('Transcription error:', err);
        showSnackbar({ message: 'Transcription failed.', variant: 'error', duration: 3000 });
      } finally {
        setTimeout(() => {
          setPendingAudioBlob(null);
          setPendingMime(null);
          setIsPlaying(false);
          setCurrTime(0);
          setDuration(0);
          setPendingAudioUrl(null);
        }, 0);
      }
      return;
    }

    // typed
    const msg = input.trim();
    if (!msg) return;
    onUserMessage(msg);
    await sendMessage(msg);
    setInput('');
  };

  return (
    <div className="mx-auto my-8 bg-white rounded-3xl shadow-lg p-4 w-[90vw]">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {pendingAudioUrl && (
            <div className="mb-2 rounded-2xl bg-[#2D1C1C] text-white px-3 py-2 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <TablerPlayerPauseFilled className="w-5 h-5 text-white" />
                  ) : (
                    <TablerPlay className="w-5 h-5 text-white" />
                  )}
                </button>
                <div className="text-xs opacity-90">
                  {formatTime(currTime)} / {formatTime(duration)}
                </div>
              </div>
              <button
                onClick={clearPendingAudio}
                className="w-7 h-7 rounded-full bg_white/10 flex items-center justify-center"
                aria-label="Remove recording"
                title="Remove recording"
              >
                <TablerX className="w-4 h-4 text-white" />
              </button>
              <audio ref={audioRef} src={pendingAudioUrl} className="hidden" preload="metadata" />
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await handleSend();
              }
            }}
            className="w-full min-h-[60px] rounded-md font-semibold focus:outline-none focus:border-transparent text-secondary resize-none"
            placeholder={isRecording ? 'Recording...' : 'Message to Tutor...'}
          />

          <div className="flex justify-between mt-2">
            <button
              onClick={handleRecord}
              className={`text-gray-700 rounded-full p-3 ring-2 transition-all ${isRecording ? 'ring-red-400 bg-red-100 animate-pulse' : 'ring-gray-300 hover:ring-gray-400'} cursor-pointer flex items-center justify-center`}
            >
              <TablerMicrophone className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() && !pendingAudioUrl}
              className="bg-background-secondary text-white border-none rounded-md px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send <TablerSend2 className="w-5 h-5 inline-block ml-1 pb-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
