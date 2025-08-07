"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";
import { themeColors, setThemeColor } from "@/utils/themeColor";

export default function AuthPage() {
  const { ready, authenticated, login, user, showModal } = usePrivy();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [hideFooter, setHideFooter] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [modalClosed, setModalClosed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const MODAL_SELECTOR = "#headlessui-portal-root";
    let wasOpen = false;

    const observer = new MutationObserver(() => {
      const isOpen = Boolean(document.body.querySelector(MODAL_SELECTOR));
      if (isOpen !== wasOpen) {
        wasOpen = isOpen;
        setHideFooter(isOpen);
        setModalOpen(isOpen);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Dynamically update browser theme color
  useEffect(() => {
    if (!ready) return;
    // User not logged in → use dark theme
    // if (!authenticated) {
    //   setThemeColor(themeColors.secondary);
    // }
    // User is logged in → use light background
    else if (authenticated && hasProfile !== null) {
      setThemeColor(themeColors.backgroundPrimary);
    }
  }, [ready, authenticated, hasProfile]);

  //Modal detection to hide footer
  useEffect(() => {
    if (typeof window === "undefined") return;
    const MODAL_SELECTOR = "#headlessui-portal-root";
    let wasOpen = false;
    const observer = new MutationObserver(() => {
      const isOpen = Boolean(document.body.querySelector(MODAL_SELECTOR));
      if (isOpen !== wasOpen) {
        wasOpen = isOpen;
        setHideFooter(isOpen);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  //Check if user has a profile in the DB
  useEffect(() => {
    if (authenticated && user?.id) {
      setHasProfile(null);
      fetch(`${API_URL}/api/profile/${user.id}`)
        .then((res) => {
          if (res.ok) {
            setHasProfile(true);
            localStorage.setItem("userId", user.id);
          } else if (res.status === 404) {
            setHasProfile(false);
          } else {
            console.error("Profile lookup error:", res.status);
            setHasProfile(false);
          }
        })
        .catch((err) => {
          console.error("Profile fetch failed:", err);
          setHasProfile(false);
        });
    }
  }, [authenticated, user]);

  //Use if still checking auth status or profile
  if (!ready || (authenticated && hasProfile === null)) {
    return (
      <div className="h-screen flex items-center justify-center">
        {/* spinner */}
        <div className="animate-spin h-12 w-12 border-4 border-secondary border-t-transparent rounded-full" />
      </div>  
    );
  }

  //Already authenticated and has profile -> redirect to home
  if (authenticated && hasProfile && !modalOpen) {
    router.push("/home");
    return null;
  }

  //Privy is ok but no profile -> show sign up form
  if (authenticated && hasProfile === false && !modalOpen) {
    return <SignUpForm />;
  }

  //Not authenticated yet -> show login card
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-4 overflow-hidden">
      <AuthCard
        hideFooter={hideFooter}
        onEmailClick={() => {
          setHideFooter(true);
          login();
        }}
      />
    </div>
  );
}
