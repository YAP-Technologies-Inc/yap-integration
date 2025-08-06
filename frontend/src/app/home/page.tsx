"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallets, useSignTypedData } from "@privy-io/react-auth";

import HeaderGreeting from "@/components/dashboard/HeaderGreeting";
import BalanceCard from "@/components/dashboard/BalanceCard";
import DailyStreak from "@/components/dashboard/DailyStreak";
import BottomNavBar from "@/components/layout/BottomNavBar";
import LessonCard from "@/components/dashboard/LessonCard";
import DailyQuizCard from "@/components/dashboard/DailyQuizPrompt";
import allLessons from "@/mock/allLessons";

import { useInitializeUser } from "@/hooks/useUserInitalizer";
import { useCompletedLessons } from "@/hooks/useCompletedLessons";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useOnChainBalance } from "@/hooks/useOnBlockChain";
import isEqual from "lodash.isequal";
import { ethers } from "ethers";
import { tokenAbi } from "@/app/abis/YAPToken";
import TestingNoticeModal from "@/components/TestingNoticeModal";
import { useMessageSignModal } from "@/components/cards/MessageSignModal";
import { useSnackbar } from "@/components/ui/SnackBar";
export default function HomePage() {
  useInitializeUser();
  // const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;
  const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BACKEND_WALLET_ADDRESS =
    process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!;
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const { open } = useMessageSignModal();
  const [lessons, setLessons] = useState<
    {
      id: string;
      title: string;
      description: string;
      status: "locked" | "available" | "completed";
    }[]
  >([]);

  const { wallets } = useWallets();
  const router = useRouter();

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const evmAddress =
    typeof window !== "undefined" ? localStorage.getItem("evmAddress") : null;

  // Fetch user-related data with SWR hooks
  const { completedLessons, isLoading: isLessonsLoading } =
    useCompletedLessons(userId);
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { stats, isLoading: isStatsLoading } = useUserStats(userId);
  const { balance: onChainBalance, isLoading: isBalanceLoading } =
    useOnChainBalance(evmAddress);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [dailyQuizCompleted, setDailyQuizCompleted] = useState(false);

  const { signTypedData } = useSignTypedData();
  // Compute lesson availability based on completed lessons
  useEffect(() => {
    if (!completedLessons) return;

    const completedSet = new Set<string>(completedLessons);

    const computed = Object.values(allLessons).map((lesson: any) => {
      const isCompleted = completedSet.has(lesson.lesson_id);
      const isFirst = lesson.lesson_id === "SPA1_001";
      const prereqs = lesson.prerequisite_lessons || [];

      const isAvailable =
        isFirst ||
        (!isCompleted && prereqs.every((p: string) => completedSet.has(p)));

      return {
        id: lesson.lesson_id,
        title: lesson.title,
        description: lesson.description,
        status: isCompleted
          ? "completed"
          : isAvailable
          ? "available"
          : "locked",
      };
    });

    // Only update state if it's actually changed
    if (!isEqual(computed, lessons)) {
      setLessons(computed);
    }
  }, [completedLessons, lessons]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/daily-quiz-status/${userId}`)
      .then((res) => res.json())
      .then((data) => setDailyQuizCompleted(data.completed))
      .catch(() => {});
  }, [userId, API_URL]);

  // Unified loading state
  if (
    isLessonsLoading ||
    isProfileLoading ||
    isStatsLoading ||
    isBalanceLoading
  ) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const handleSpanishTeacherAccess = async () => {
    setCheckingAccess(true);

    try {
      if (!TOKEN_ADDRESS || !userId) {
        showSnackbar({
          message: "Missing config or user ID.",
          variant: "error",
        });
        return;
      }

      // STEP 1: Check session
      const { hasAccess } = await (
        await fetch(`${API_URL}/api/teacher-session/${userId}`)
      ).json();

      if (hasAccess) {
        router.push("/spanish-teacher");
        return;
      }

      // STEP 2: Custom modal first
      const confirm = await open("Spend 1 YAP to access Spanish Teacher?");
      if (!confirm) return;

      const embedded = wallets.find((w) => w.walletClientType === "privy");
      if (!embedded) {
        showSnackbar({
          message: "Please connect your wallet.",
          variant: "error",
        });
        return;
      }

      const ethProvider = await embedded.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const oneYap = ethers.parseUnits("1", 18);
      const nonce = await token.nonces(walletAddress);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const domain = {
        name: "YapTokenTestV2",
        version: "1",
        chainId: 1328,
        verifyingContract: TOKEN_ADDRESS,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: walletAddress,
        spender: BACKEND_WALLET_ADDRESS,
        value: oneYap.toString(),
        nonce: nonce.toString(),
        deadline,
      };

      // ✅ Sign without showing Privy's modal
      const { signature } = await signTypedData(
        {
          domain,
          types,
          message,
          primaryType: "Permit",
        },
        {
          address: walletAddress,
          uiOptions: {
            showWalletUIs: false, // ✅ suppress modal
          },
        }
      );

      // STEP 3: Submit signature to backend
      const snackId = Date.now();
      showSnackbar({
        id: snackId,
        message: "Verifying transaction on-chain…",
        variant: "completion",
        manual: true,
      });

      const res = await fetch(`${API_URL}/api/request-spanish-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          walletAddress,
          permit: {
            ...message,
            signature,
          },
        }),
      });

      removeSnackbar(snackId);

      if (!res.ok) {
        showSnackbar({ message: "Verification failed.", variant: "error" });
        return;
      }

      showSnackbar({
        message: "Access granted! Redirecting…",
        variant: "success",
        duration: 3000,
      });

      router.push("/spanish-teacher");
    } catch (err) {
      console.error("Permit error:", err);
      showSnackbar({
        message: "Failed to authorize payment.",
        variant: "error",
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  const dailyQuizUnlocked = completedLessons?.includes("SPA1_005");
  const handleDailyQuizUnlocked = () => {
    if (!dailyQuizUnlocked) {
      showSnackbar({
        message: "Please complete Lesson 5 to unlock the Daily Quiz.",
        variant: "info",
        duration: 3000,
      });
      return;
    }
    if (dailyQuizCompleted) {
      showSnackbar({
        message: "You have already completed today's Daily Quiz.",
        variant: "info",
        duration: 3000,
      });
      return;
    }
    router.push("/daily-quiz");
  };

  return (
    <div className="bg-background-primary min-h-[100dvh] w-full flex flex-col overflow-y-auto pb-nav">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <TestingNoticeModal />
        <h3 className="text-secondary text-xl font-semibold mt-2">Lessons</h3>
        <div className="mt-2 overflow-x-auto">
          <div className="flex gap-4 px-4 -mx-4 w-max">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                status={lesson.status}
                onClick={() => router.push(`/lesson/${lesson.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Talk to Spanish Teacher */}
        <div className="mt-4">
          <button
            onClick={handleSpanishTeacherAccess}
            className="w-full bg-secondary hover:bg-secondary-darker text-white font-bold py-3 rounded hover:cursor-pointer transition-colors duration-200 shadow-md"
            disabled={checkingAccess}
          >
            {checkingAccess
              ? "Checking access…"
              : "Talk to Spanish Teacher (1 YAP)"}
          </button>
        </div>
        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-2 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0 " onClick={handleDailyQuizUnlocked}>
          <DailyQuizCard
            isUnlocked={dailyQuizUnlocked}
            isCompleted={dailyQuizCompleted}
          />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
