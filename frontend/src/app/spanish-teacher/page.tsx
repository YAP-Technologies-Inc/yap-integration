"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { useRouter } from "next/navigation";
import { useSnackbar, removeSnackbar } from "@/components/ui/SnackBar";
import { TablerX } from "@/icons";
import { handleSpanishTeacherAccessFromPage } from "@/utils/handleSpanishTeacherAccessFromPage";
import { useMessageSignModal } from "@/components/cards/MessageSignModal";
import { useWallets, useSignTypedData } from "@privy-io/react-auth";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Tutor from "@/components/cards/Tutor";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useUserProfile } from "@/hooks/useUserProfile";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [isVerifyingPermit, setIsVerifyingPermit] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const { open } = useMessageSignModal(); // ← you missed this
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  const [userId, setUserId] = useState<string | null>(null);

  // Add the user profile hook
  const { name: userName } = useUserProfile(userId);

  const { signTypedData } = usePrivy();
  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onMessage: (msg) => {
      if (typeof msg.message !== "string") return;
      const sender = msg.source === "user" ? "user" : "ai";
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
      console.error("Conversation error:", err);
      setError(
        `Connection error: ${typeof err === "string" ? err : "Unknown error"}`
      );
    },
    onStatusChange: (status?: string) => {
      console.log("Connection status changed:", status);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = useCallback(async () => {
    console.log("Starting conversation...", { hasAccess, sessionStarted, isLoading });
    setError(null);
    setMessages([]);
    setIsLoading(true);

    try {


      await conversation.startSession({ agentId: AGENT_ID as string });
      setSessionStarted(true);

    } catch (err: any) {
      console.error("Start session failed:", err);
      setError(`Failed to start: ${err?.message ?? String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, AGENT_ID, hasAccess, sessionStarted, isLoading]);

  useEffect(() => {
    checkAccessOrPrompt();
  }, []);

  const checkAccessOrPrompt = async () => {
    const stored = localStorage.getItem("userId");
    if (!stored) return;

    setUserId(stored);

    try {
      // STEP 1: Check backend for active session
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher-session/${stored}`
      );
      const data = await res.json();

      if (data.hasAccess) {
        setHasAccess(true);
        return;
      }

      // STEP 2: Show modal with Yap offer
      const confirmed = await open(
        `Get 20 mins of personalized Spanish tutoring for just 1 Yap.\nYour AI tutor will assess your level, identify your strengths, and help you improve pronunciation in real-time.`
      );

      if (!confirmed) {
        router.push("/home");
        return;
      }

      setCheckingAccess(true); // optional loading state

      try {
        const ethProvider = await embeddedWallet.getEthereumProvider();
        const provider = new ethers.BrowserProvider(ethProvider);
        const signer = await provider.getSigner();

        await handleSpanishTeacherAccessFromPage({
          userId: stored,
          open,
          showSnackbar,
          signer,
          BACKEND_WALLET_ADDRESS:
            process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!,
          TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
          API_URL: process.env.NEXT_PUBLIC_API_URL!,
          router,
          setCheckingAccess,
          setIsVerifyingPermit,
          removeSnackbar,
          signTypedData,
        });
      } catch (err) {
        console.error("Payment/session failed:", err);
        showSnackbar({
          message: "Something went wrong while verifying access.",
          variant: "error",
        });
        router.push("/home");
      } finally {
        setCheckingAccess(false);
      }

      // After token is paid and session stored in DB, access is granted
      setHasAccess(true);
    } catch (err) {
      console.error("Session check failed:", err);
      showSnackbar({
        message: "Failed to check session access.",
        variant: "error",
      });
      router.push("/home");
    }
  };

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("End session failed:", err);
    }
  }, [conversation]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasAccess && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startConversation();
    }
  }, [hasAccess, startConversation]);

  const isConnected = conversation.status === "connected";


  // Show connection status in UI
  if (!hasAccess) {
    return (
      <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)] relative"></div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)]">
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-20 flex items-center justify-center px-4">
        <button
          onClick={() => router.push("/home")}
          className="absolute left-4"
        >
          <TablerX className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#2D1C1C]">Tutor</h1>
          {/* Add connection status indicator */}
          <div className="text-xs text-gray-500">
            Status: {conversation.status} {isConnected ? "" : ""}
          </div>
        </div>
      </div>

      <div
        className="pt-16 pb-24 fixed inset-0 overflow-y-auto z-10"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full h-full flex flex-col items-center">
          {error && (
            <div className="mb-2 text-red-500 text-center text-xs">{error}</div>
          )}
          <div className="flex-1 w-full max-w-none overflow-y-auto px-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-1">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Profile Picture - Left side */}
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        AI
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[70vw] text-sm shadow-sm ${
                      msg.sender === "user"
                        ? "bg-background-secondary text-white"
                        : "bg-[#f1f3f5] text-[#2D1C1C]"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* User Profile Picture - Right side */}
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {userName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-[56px] pb-2 z-20 flex justify-center items-center">
        <Tutor
          sendMessage={async (message: string) => {
            try {
              await conversation.sendUserMessage(message);
            } catch (err) {
              console.error("Error sending message:", err);
              showSnackbar({
                message: "Failed to send message",
                variant: "error",
              });
            }
          }}
          onUserMessage={(text: string) => {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text,
                sender: "user",
                timestamp: new Date(),
              },
            ]);
          }}
          userName={userName} // Pass the user name from the hook
        />
      </div>
      <BottomNavBar />
    </div>
  );
}
