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
import { getQuizState } from "@/utils/dailyQuizStorage";
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
  
  const totalQuizItems = 5; // length of mockDailyQuiz[0].questions
  const quizState =
    typeof window !== "undefined"
      ? getQuizState(totalQuizItems)
      : { attemptsLeft: 3, avgScore: 0, completed: false };

  // If quiz is failed and no attempts left, lock the daily quiz again
  const isQuizLocked =
    quizState.attemptsLeft === 0 && !quizState.completed && quizState.avgScore === 0;

  const dailyQuizUnlocked =
    completedLessons?.includes("SPA1_005") && !isQuizLocked;

  const handleDailyQuizUnlocked = () => {
    if (!dailyQuizUnlocked) {
      showSnackbar({
        message: isQuizLocked
          ? "No attempts left. Daily Quiz is locked until tomorrow."
          : "Please complete Lesson 5 to unlock the Daily Quiz.",
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

  if (userId === null) {
    router.push("/auth");
    return null;
  }

  if (
    isLessonsLoading ||
    isProfileLoading ||
    isStatsLoading ||
    isBalanceLoading
  ) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background-primary">
        <p className="text-secondary text-lg font-semibold">
          Loading dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-[100dvh] w-full flex flex-col overflow-y-auto overflow-x-hidden pb-nav">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <TestingNoticeModal />
        <div className="flex items-center justify-between mt-2">
          <h3 className="text-secondary text-xl font-semibold">Lessons</h3>
          {/* TODO: Implement this */}
          {/* <h6 className="text-secondary text-md font-extralight ">See all</h6> */}
        </div>
        <div className="overflow-x-auto pb-2">
          {" "}
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
        <div className="mt-3">
          <button
            onClick={() => router.push("/spanish-teacher")}
            className="w-full border-b-3 border-black bg-secondary hover:bg-secondary-darker text-white font-bold py-3 rounded-2xl hover:cursor-pointer transition-colors duration-200 shadow-md"
          >
            Talk to Spanish Teacher
          </button>
        </div>
        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-2 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0 " onClick={handleDailyQuizUnlocked}>
          <DailyQuizCard
            isUnlocked={dailyQuizUnlocked}
            isCompleted={dailyQuizCompleted || quizState.completed}
            attemptsLeft={quizState.attemptsLeft}
            avgScore={quizState.avgScore}
          />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
