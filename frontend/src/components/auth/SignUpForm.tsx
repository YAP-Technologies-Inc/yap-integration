"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import SelectLanguageForm from "@/components/auth/SelectLanguageForm";
import SecuringLoader from "../loading/SecuringLoader";
import AuthLogo from "@/components/auth/AuthLogo";
import { useSnackbar } from "../ui/SnackBar";
export default function SignUpForm() {

  const { user } = usePrivy();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [step, setStep] = useState<"signup" | "language" | "loading">("signup");
  const [name, setName] = useState("");
  const { showSnackbar } = useSnackbar();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      setStep("language");
    }
  };

  //Handles final submission after language selection
  // This will save the user profile and redirect to the home page
  // It will also set the userId in localStorage for future use
  // This is the last step in the signup process
  // Need this to be secure and handle errors properly
  // TODO: if user already exists, we should redirect them to the home page instead of asking for name again

  const handleFinalSubmit = async (language: string) => {
    setStep("loading");

    const payload = {
      user_id: user?.id,
      name,
      language_to_learn: language,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/secure-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save user");
      }

      localStorage.setItem("userId", data.user_id);
    } catch (err) {
      console.error("Failed to save user:", err);
        showSnackbar({
          message: "Something went wrong. Please try again.",
          variant: "error",
          duration: 3000,
        });
      setStep("language");
    }
  };

  if (step === "loading") return <SecuringLoader />;

  if (step === "language") {
    return (
      <SelectLanguageForm
        onNext={() => {}}
        onBack={() => setStep("signup")}
        onSelect={handleFinalSubmit}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background-primary px-4 flex flex-col">
      <div className="flex flex-col items-center">
        <AuthLogo variant="red" />
      </div>
      <div className="flex flex-col items-center">
        <div className=" mb-4 text-center">
          <h2
            className="text-2xl pt-8 font-semibold text-secondary
        lg:w-max-lg
        "
          >
            Create an account
          </h2>
          <p className="text-base text-[#696262] mt-1">
            Let&#39;s get started! Enter your name below.
          </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col pt-2 items-center">
        <form
          onSubmit={handleNameSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
          id="signup-form"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border-b-3 border-r-1 border-[#e2ddd3] placeholder-[#A59C9C] text-secondary outline-none"
            required
          />
        </form>
      </div>

      <div
        className="w-full mt-auto pb-2 flex justify-center
      lg:pb-8
      "
      >
        <button
          type="submit"
          form="signup-form"
          className="w-full max-w-sm bg-secondary text-white font-semibold py-4 px-8 rounded-full border-b-3 border-r-1 border-black hover:cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
