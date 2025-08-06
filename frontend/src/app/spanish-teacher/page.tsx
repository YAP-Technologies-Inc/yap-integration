'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@11labs/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/components/ui/SnackBar';
import { TablerChevronLeft } from '@/icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

  const [userId, setUserId] = useState<string | null>(null);

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onMessage: (msg) => {
      if (typeof msg.message !== 'string') return;
      const sender = msg.source === 'user' ? 'user' : 'ai';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: msg.message,
          sender,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (err) => {
      console.error('Conversation error:', err);
      setError(
        `Connection error: ${typeof err === 'string' ? err : 'Unknown error'}`
      );
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = useCallback(async () => {
    setError(null);
    setMessages([]);
    setIsLoading(true);

    try {
      const conversationId = await conversation.startSession({
        agentId: AGENT_ID as string,
      });
    } catch (err: any) {
      console.error('Start session failed:', err);
      setError(`Failed to start: ${err?.message ?? String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  useEffect(() => {
    const loadAndCheckAccess = async () => {
      const stored = localStorage.getItem('userId');
      if (!stored) return;

      setUserId(stored); // Optional, if you still need userId in other places

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher-session/${stored}`
        );
        const data = await res.json();

        if (!data.hasAccess) {
          showSnackbar({
            message: 'You do not have access to the Spanish Teacher.',
            variant: 'info',
            duration: 3000,
          });
          router.push('/home');
          return;
        }

        const msLeft = new Date(data.expiresAt).getTime() - Date.now();
        if (msLeft > 5 * 60 * 1000) {
          setTimeout(() => {
            showSnackbar({
              message: 'Your session will expire in 5 minutes.',
              variant: 'info',
              duration: 3000,
            });
          }, msLeft - 5 * 60 * 1000);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        showSnackbar({
          message: 'Failed to check session access.',
          variant: 'info',
          duration: 3000,
        });
        router.push('/home');
      }
    };

    loadAndCheckAccess();
  }, [userId, router, showSnackbar]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('End session failed:', err);
    }
  }, [conversation]);

  const isConnected = conversation.status === 'connected';

  return (
    <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)]">
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-20 flex items-center justify-center px-4">
        <button
          onClick={() => router.push('/home')}
          className="absolute left-4"
        >
          <TablerChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2D1C1C]">
            AI Spanish Teacher
          </h1>
          <p className="text-sm text-[#5C4B4B]">
            Practice your Spanish conversation
          </p>
        </div>
      </div>

      <div
        className="pt-16 px-4 pb-24 overflow-y-auto h-[100dvh]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-4 flex flex-col h-[30dvh]">
          {error && (
            <div className="mb-2 text-red-500 text-center text-xs">{error}</div>
          )}
          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-1">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-1 max-w-[70%] text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#FFD166] text-[#2D1C1C]'
                        : 'bg-[#f1f3f5] text-[#2D1C1C]'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className="text-xs text-gray-400 text-right mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>


      <div className="fixed inset-x-0 bottom-[env(safe-area-inset-bottom)] pb-2 px-4 z-20">
        {!isConnected ? (
          <button
            onClick={startConversation}
            disabled={isLoading}
            className={`w-full bg-secondary text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-200 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-secondary-dark'
            }`}
          >
            {isLoading ? 'Connecting…' : 'Start Conversation'}
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
          >
            End Conversation
          </button>
        )}
      </div>
    </div>
  );
}
