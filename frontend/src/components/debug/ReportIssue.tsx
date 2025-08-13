"use client";

import { useState } from "react";
import { TablerX } from "@/icons";
import { useSnackbar } from "@/components/ui/SnackBar";

interface ReportIssueProps {
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function ReportIssue({ onClose }: ReportIssueProps) {
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState(false);
  const [toastId, setToastId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const reason = (form.elements.namedItem("reason") as HTMLInputElement)
      ?.value;
    const explain = (form.elements.namedItem("explain") as HTMLTextAreaElement)
      ?.value;

    if (!reason || !explain) {
      showSnackbar({
        message: "Please fill in all fields.",
        variant: "error",
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);

    const snackId = Date.now();
    showSnackbar({
      id: snackId,
      message: "Submitting report…",
      variant: "completion",
      manual: true,
    });

    try {
      const res = await fetch(`${API_URL}/api/report-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, explain }),
      });

      removeSnackbar(snackId);

      if (!res.ok) throw new Error("Server error");

      showSnackbar({
        message: "Thanks for the report!",
        variant: "custom",
        duration: 3000,
      });

      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Report error:", err);
      removeSnackbar(snackId);
      showSnackbar({
        message: "Error submitting issue. Please try again.",
        variant: "error",
        duration: 3000,
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-[100dvh] bg-black bg-opacity-40">
      {submitting && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm" />
      )}

      <div className="bg-background-primary w-full max-w-full min-h-[100dvh] flex flex-col justify-start pt-1.5 px-4 pb-2">
        {/* Modal Header */}
        <div className="flex items-center pb-2">
          <button
            onClick={onClose}
            className="text-secondary hover:cursor-pointer rounded-full hover:bg-gray-100 "
          >
            <TablerX className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-secondary font-bold text-xl ml-4">
            Report an Issue
          </h2>
          <div className="w-10" />
        </div>

        <form
          id="report-issue-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <input
              name="reason"
              type="text"
              className="focus:outline-none focus:border-transparent w-full border border-b-3 border-r-1 border-[#e2ddd3] rounded-lg px-3 py-2 bg-white text-black"
              placeholder="What's the reason?"
            />
          </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explain
            </label>
            <textarea
              name="explain"
              rows={9}
              className="focus:outline-none focus:border-transparent w-full border-b-3 border-r-1 border-[#e2ddd3] rounded-lg px-3 py-2 bg-white text-black resize-none"
              placeholder="Tell us more..."
            />
            </div>
        </form>

        <button
          type="submit"
          form="report-issue-form"
          className="bg-secondary text-white py-4 px-4 rounded-full border-b-3 border-r-1 border-black mt-auto"
          disabled={submitting}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
