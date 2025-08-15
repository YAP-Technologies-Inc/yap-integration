// This component renders a card for each lesson in the dashboard.
// It displays the lesson title, description, and status (completed, locked, or available).
// Clicking on an available lesson navigates to the lesson page.
"use client";

import { useRouter } from "next/navigation";
import { TablerCheck } from "@/icons";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  status: "completed" | "locked" | "available";
}

export default function LessonCard({
  title,
  description,
  status,
  id,
}: LessonCardProps) {
  const router = useRouter();

  const baseClasses =
    "relative rounded-2xl px-4 py-6 w-40 h-32 border-b-3 border-[#d12a2c] flex-shrink-0 flex flex-col justify-center items-center text-center transition-transform";
  const statusClasses =
    status === "completed"
      ? "bg-red-500 border-b-3 border-[#d12a2c] text-white hover:cursor-not-allowed"
      : status === "locked"
      ? "bg-gray-200 border-b-3 border-[#e2ddd3] text-gray-500 hover:cursor-not-allowed "
      : "bg-white border-b-3 border-gray-300 text-[#2D1C1C] hover:cursor-pointer";

  const handleClick = () => {
    if (status === "available") {
      router.push(`/lesson/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseClasses} ${statusClasses} items-start justify-start pt-4`}
      style={{ marginTop: "12px" }}
    >
      {status === "completed" && (
      <span className="absolute top-2 left-3 w-5 h-5 flex items-center justify-center rounded-2xl bg-tertiary">
        <TablerCheck className="w-3 h-3 text-bold text-white" />
      </span>
      )}
      <h3 className="text-xl font-bold mt-4 self-start">
        Lesson{" "}
        {(() => {
          const num = id.split("_")[1];
          return String(Number(num));
        })()}
      </h3>
      <p
      className="text-sm self-start text-left break-words whitespace-pre-line w-full"
      style={{
        wordBreak: "break-word",
        whiteSpace: "pre-line",
        maxWidth: "100%",
      }}
      >
      {title}
      </p>
    </div>
  );
}
