"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";
import LoginForm from "@/components/auth/LoginForm";
import { setThemeColor, themeColors } from "@/utils/themeColor";

export default function AuthPage() {
const { ready, authenticated, login } = usePrivy();
  const [formType, setFormType] = useState<"signup" | "login" | null>(null);
  const [showModal, setShowModal] = useState(false);
  //Sets the theme color based on the form type for IOS notch
  useEffect(() => {
    if (formType === null) {
      setThemeColor(themeColors.secondary);
    } else {
      setThemeColor(themeColors.backgroundPrimary);
    }
  }, [formType]);

  // Handle Privy login modal state
  useEffect(() => {
  if (authenticated) {
    setShowModal(false);
    setFormType('signup');
  }
}, [authenticated]);

  if (!ready) return <div>Loading Privy...</div>;

  return (
    <div
      className={`min-h-screen w-screen ${
        formType === null ? "bg-background-secondary" : "bg-background-primary"
      } flex flex-col items-center justify-center`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="relative z-10 w-full flex items-center justify-center">
        {authenticated && (formType === "signup" || formType === null) && (
          <SignUpForm
            onBack={() => setFormType(null)}
            onSwitch={() => setFormType("login")}
          />
        )}

        {formType === "login" && (
          <LoginForm
            onBack={() => setFormType(null)}
            onSwitch={() => setFormType("signup")}
          />
        )}

        {!showModal && !authenticated && formType === null && (
          <AuthCard
            onEmailClick={() => {
              setShowModal(true);
              login(); // open the Privy modal
            }}
            onSwitch={() => setFormType("login")}
          />
        )}
      </div>
    </div>
  );
}
