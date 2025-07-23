'use client';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function SpanishTeacherConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const ELEVENLABS_API_KEY =
    'sk_3d18455ea5f8f28b7a8fe3b8539d1b8ee54f75c8951406af';
  const AGENT_ID = 'agent_01k0mav3kjfk3s4xbwkka4yg28';

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onConnect: () => setDebugInfo('Connected to Spanish Teacher agent'),
    onDisconnect: () => setDebugInfo('Disconnected from agent'),
    onMessage: (message) => {
      if (message.source === 'user' && typeof message.message === 'string') {
        addMessage(message.message, 'user');
      } else if (typeof message.message === 'string') {
        addMessage(message.message, 'ai');
      }
    },
    onError: (error) => {
      setError(
        `Connection error: ${
          typeof error === 'string' ? error : 'Unknown error'
        }`
      );
      setDebugInfo(`Error details: ${JSON.stringify(error)}`);
    },
  });

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo('Starting connection to Spanish Teacher...');
    setMessages([]);
    try {
      setDebugInfo('Requesting microphone and starting session...');
      await conversation.startSession();
      setDebugInfo('Session started with Spanish Teacher');
    } catch (error: any) {
      setError(
        'Failed to start conversation: ' + (error?.message || 'Unknown error')
      );
    }
    setIsLoading(false);
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    setDebugInfo('Ending conversation...');
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="min-h-screen bg-[#f7f3ec] flex flex-col items-center justify-start p-8">
      <div>
        <button
          onClick={() => router.push('/home')}
          className="absolute top-6 left-6 z-10 bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold shadow-sm"
        >
          &lt; Back
        </button>
        <div className="w-full max-w-md bg-[#fffbe6] rounded-2xl shadow-lg p-8 mt-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#2D1C1C] mb-2">
            AI Spanish Teacher
          </h2>
          <p className="text-base text-[#5C4B4B] mb-4">
            Practice your Spanish conversation
          </p>
          {conversation.status === 'connected' && (
            <button
              onClick={stopConversation}
              className="bg-red-500 text-white rounded-lg px-5 py-2 font-semibold text-lg shadow-md"
            >
              End Conversation
            </button>
          )}
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 min-h-[320px] flex flex-col justify-end">
          {error && (
            <div className="text-red-500 bg-red-100 rounded-lg px-3 py-2 mb-3 text-center font-medium">
              {error}
            </div>
          )}
          {debugInfo && (
            <div className="text-gray-600 bg-[#f7f3ec] rounded-lg px-3 py-2 mb-2 text-sm">
              <strong>Debug:</strong> {debugInfo}
            </div>
          )}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center mt-8">
                <h3 className="text-lg font-semibold text-[#2D1C1C] mb-4">
                  Ask the AI Spanish Teacher anything in Spanish!
                </h3>
                <button
                  onClick={startConversation}
                  disabled={conversation.status === 'connected' || isLoading}
                  className={`bg-[#2D1C1C] text-[#FFD166] rounded-lg px-8 py-3 font-bold text-lg shadow-md ${
                    conversation.status === 'connected' || isLoading
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {isLoading ? 'Connecting...' : 'Start Conversation'}
                </button>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                  <div
                    className={`${
                      msg.sender === 'user' ? 'bg-[#FFD166]' : 'bg-[#f7f3ec]'
                    } text-[#2D1C1C] rounded-lg px-4 py-2 max-w-[80%] text-base font-medium shadow-sm`}
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
      </div>
    </div>
  );
}
