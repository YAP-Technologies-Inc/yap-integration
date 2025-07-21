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

  // Use your ElevenLabs API key and agent ID
  const ELEVENLABS_API_KEY = 'sk_3d18455ea5f8f28b7a8fe3b8539d1b8ee54f75c8951406af';
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
      setError(`Connection error: ${typeof error === 'string' ? error : 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(error)}`);
    },
  });

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    setMessages(prev => [
      ...prev, 
      { 
        id: Date.now().toString(),
        text,
        sender,
        timestamp: new Date()
      }
    ]);
  };

  // Auto-scroll to the bottom
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
      setError('Failed to start conversation: ' + (error?.message || 'Unknown error'));
    }
    setIsLoading(false);
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    setDebugInfo('Ending conversation...');
    await conversation.endSession();
  }, [conversation]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f3ec',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '32px 8px',
      }}
    >
      <button
        onClick={() => router.push('/home')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 100,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}
      >
        &lt; Back
      </button>
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fffbe6',
          borderRadius: 18,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '32px 24px 24px 24px',
          marginTop: 24,
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#2D1C1C', marginBottom: 8 }}>
          AI Spanish Teacher
        </h2>
        <p style={{ fontSize: 16, color: '#5C4B4B', marginBottom: 18 }}>
          Practice your Spanish conversation
        </p>
        {conversation.status === 'connected' && (
          <button
            onClick={stopConversation}
            style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 0,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            End Conversation
          </button>
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '24px 18px',
          minHeight: 320,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {error && (
          <div style={{
            color: '#e74c3c',
            background: '#fff0f0',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 12,
            textAlign: 'center',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}
        {debugInfo && (
          <div style={{
            color: '#888',
            background: '#f7f3ec',
            borderRadius: 8,
            padding: '6px 10px',
            marginBottom: 10,
            fontSize: 13,
            textAlign: 'left',
          }}>
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#2D1C1C', marginBottom: 18 }}>
                Ask the AI Spanish Teacher anything in Spanish!
              </h3>
              <button
                onClick={startConversation}
                disabled={conversation.status === 'connected' || isLoading}
                style={{
                  background: '#2D1C1C',
                  color: '#FFD166',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 32px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: conversation.status === 'connected' || isLoading ? 'not-allowed' : 'pointer',
                  opacity: conversation.status === 'connected' || isLoading ? 0.6 : 1,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {isLoading ? 'Connecting...' : 'Start Conversation'}
              </button>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'user' ? '#FFD166' : '#f7f3ec',
                    color: '#2D1C1C',
                    borderRadius: 12,
                    padding: '10px 16px',
                    maxWidth: '80%',
                    fontSize: 16,
                    fontWeight: 500,
                    boxShadow: msg.sender === 'user'
                      ? '0 1px 4px rgba(255,209,102,0.15)'
                      : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ marginBottom: 4 }}>{msg.text}</div>
                  <div style={{ fontSize: 12, color: '#A59C9C', textAlign: 'right' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
} 