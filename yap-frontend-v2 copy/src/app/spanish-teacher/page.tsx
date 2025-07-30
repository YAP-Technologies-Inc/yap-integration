'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@11labs/react';
import { useRouter } from 'next/navigation';
import { TablerChevronLeft } from '@/icons'; // Ensure this is properly exported

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function SpanishTeacherConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const ELEVENLABS_API_KEY = 'sk_3d18455ea5f8f28b7a8fe3b8539d1b8ee54f75c8951406af';
  const AGENT_ID = 'agent_01k0mav3kjfk3s4xbwkka4yg28';
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // const API_URL = "https://api.dev.yapapp.io";

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onConnect: () => setDebugInfo('Connected to Spanish Teacher'),
    onDisconnect: () => setDebugInfo('Disconnected from agent'),
    onMessage: (message) => {
      if (typeof message.message === 'string') {
        addMessage(message.message, message.source === 'user' ? 'user' : 'ai');
      }
    },
    onError: (error) => {
      setError(`Connection error: ${typeof error === 'string' ? error : 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(error)}`);
    },
  });

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, sender, timestamp: new Date() },
    ]);
  };

  //TODO: FIX THIS it doesnt log the time and wont route if time expires only when we exit and come back will it then not render this page
  // const checkAccess = async () => {
  //   if (!userId) return router.push('/home');

  //   try {
  //     const res = await fetch(`${API_URL}/api/teacher-session/${userId}`);
  //     const data = await res.json();

  //     if (data.hasAccess) {
  //       setHasAccess(true);

  //       if (data.expires_at) {
  //         const interval = setInterval(() => {
  //           const timeLeft = new Date(data.expires_at).getTime() - Date.now();
  //           const mins = Math.floor(timeLeft / 1000 / 60);
  //           const secs = Math.floor((timeLeft / 1000) % 60);

  //           console.log(`Time left: ${mins}m ${secs}s`);

  //           if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4.9 * 60 * 1000) {
  //             alert('You have 5 minutes left in your session.');
  //           }

  //           if (timeLeft <= 0) {
  //             alert('Session expired. Redirecting...');
  //             router.push('/home');
  //           }
  //         }, 10000);

  //         return () => clearInterval(interval);
  //       }
  //     } else {
  //       setHasAccess(false);
  //       setTimeout(() => router.push('/home'), 3000);
  //     }
  //   } catch (err) {
  //     console.error('Access check failed:', err);
  //     setHasAccess(false);
  //     setTimeout(() => router.push('/home'), 3000);
  //   }
  // };

  // useEffect(() => {
  //   checkAccess();
  // }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo('Requesting mic and starting session...');
    setMessages([]);

    try {
      await conversation.startSession();
      setDebugInfo('Session started — waiting for agent...');
    } catch (error: any) {
      setError('Failed to start: ' + (error?.message || 'Unknown error'));
    }

    setIsLoading(false);
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    setDebugInfo('Ending session...');
    await conversation.endSession();
  }, [conversation]);

  // if (hasAccess === false) {
  //   return (
  //     <div className="min-h-screen bg-[#fff8f5] flex items-center justify-center px-4">
  //       <div className="bg-white border border-red-200 rounded-xl shadow-md p-6 text-center max-w-sm">
  //         <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
  //         <p className="text-sm text-gray-700">You don't have access. Redirecting…</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (hasAccess === null) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[#fefbf5]">
  //       <p className="text-gray-500 text-sm font-medium animate-pulse">Checking access…</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#f7f3ec] flex flex-col items-center py-10 px-4 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/home')}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-gray-700 text-sm font-medium"
      >
        <TablerChevronLeft className="w-5 h-5" />
        Back
      </button>

      {/* Header */}
      <div className="w-full max-w-md bg-[#fffbe6] rounded-2xl shadow-lg p-6 mb-4 text-center">
        <h2 className="text-2xl font-bold text-[#2D1C1C]">AI Spanish Teacher</h2>
        <p className="text-sm text-[#5C4B4B] mt-1">Practice Spanish with your AI-powered tutor</p>
      </div>

      {/* Chat Area */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4 flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="text-red-500 bg-red-100 rounded-lg px-3 py-2 mb-2 text-center font-medium">
            {error}
          </div>
        )}
        {debugInfo && (
          <div className="text-gray-600 bg-gray-100 rounded-lg px-3 py-2 mb-3 text-sm">
            {debugInfo}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1 mb-2 space-y-2">
          {messages.length === 0 ? (
            <div className="text-center mt-8 text-gray-600 font-medium">
              Press "Start Conversation" to begin.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${
                    msg.sender === 'user' ? 'bg-[#FFD166]' : 'bg-[#f1ece6]'
                  } text-[#2D1C1C] rounded-xl px-4 py-2 max-w-[80%] text-base shadow-sm`}
                >
                  <div className="mb-1">{msg.text}</div>
                  <div className="text-xs text-gray-500 text-right">
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

      {/* 🎛 Toggle Button */}
      <div className="w-full max-w-md fixed bottom-6 left-0 right-0 mx-auto flex justify-center px-4">
        <button
          onClick={
            conversation.status === 'connected' ? stopConversation : startConversation
          }
          disabled={isLoading}
          className={`w-full ${
            conversation.status === 'connected'
              ? 'bg-red-500 text-white'
              : 'bg-[#2D1C1C] text-[#FFD166]'
          } rounded-full px-6 py-3 font-bold text-base shadow-md transition ${
            isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {isLoading
            ? 'Connecting...'
            : conversation.status === 'connected'
            ? 'End Conversation'
            : 'Start Conversation'}
        </button>
      </div>
    </div>
  );
}
