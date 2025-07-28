"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "@privy-io/react-auth";

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
import { useToast } from "@/components/ui/ToastProvider";

export default function HomePage() {
  useInitializeUser();
  const { pushToast } = useToast();
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

  const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;
  const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const handleSpanishTeacherAccess = async () => {
    setCheckingAccess(true);

    try {
      // sanity checks
      if (!TOKEN_ADDRESS || !TREASURY_ADDRESS) {
        pushToast("Payment not configured.", "error");
        return;
      }
      if (!userId) {
        pushToast("You must be logged in.", "error");
        return;
      }

      // try to check existing session
      let hasAccess = false;
      try {
        const sessionRes = await fetch(
          `${API_URL}/api/teacher-session/${userId}`
        );
        if (sessionRes.ok) {
          const { hasAccess: accessFlag } = (await sessionRes.json()) as {
            hasAccess: boolean;
          };
          hasAccess = accessFlag;
        } else {
          console.warn("Session check returned status", sessionRes.status);
        }
      } catch (e) {
        console.warn("Could not reach session endpoint:", e);
      }

      // if still in 20 min window, shortcut
      if (hasAccess) {
        router.push("/spanish-teacher");
        return;
      }

      // no valid session → do on‑chain payment
      const embedded = wallets.find((w) => w.walletClientType === "privy");
      if (!embedded) {
        pushToast("Please connect your wallet.", "error");
        return;
      }

      const ethProvider = await embedded.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();
      const me = await signer.getAddress();

      // instantiate token & check balance
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const rawBal = await token.balanceOf(me); // bigint
      const oneYap = ethers.parseUnits("1", 18); // bigint

      if (rawBal < oneYap) {
        const human = ethers.formatUnits(rawBal, 18);
        pushToast(`You only have ${human} YAP; you need ≥ 1 YAP.`, "error");
        return;
      }

      // send payment
      const tx = await token.transfer(TREASURY_ADDRESS, oneYap, { type: 0 });
      await tx.wait();
      console.log("Paid 1 YAP, tx hash:", tx.hash);

      // record the new session on backend (expires_at gets set there)
      try {
        await fetch(`${API_URL}api/request-spanish-teacher`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, txHash: tx.hash }),
        });
      } catch (e) {
        console.warn("Could not log payment:", e);
      }

      // finally take them through
      router.push("/spanish-teacher");
    } catch (outer) {
      console.error("Payment error:", outer);
      pushToast((outer as Error).message || "Could not process payment.", "error");
    } finally {
      setCheckingAccess(false);
    }
  };

  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col overflow-y-auto pb-24">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>

        <h3 className="text-secondary text-xl font-semibold mt-2">Lessons</h3>
        <div className="mt-2">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lessonId={lesson.id}
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
            className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded"
            disabled={checkingAccess}
          >
            {checkingAccess ? "Checking access…" : "Talk to Spanish Teacher"}
          </button>
        </div>

        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-2 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0">
          <DailyQuizCard isUnlocked={false} />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
