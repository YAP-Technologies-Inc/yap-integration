// SecuringLoader.tsx
// This component displays a loader while securing the user's account.
// TODO: This is onyl a placeholder for now, we will need to implement the actual logic later.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "../../components/layout/SplashScreen";
import "./SecuringLoader.css";

export default function SecuringLoader() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);

  // Phase 1: "Securing your account..." loader
  // Then after 3 seconds, show the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(true); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Phase 2: After 3-slide splash is done, push to home
  const handleFinishSplash = () => {
    router.push("/home");
  };

  // If splash is active, render it
  // Otherwise, render the loader
  if (showSplash) return <SplashScreen onFinish={handleFinishSplash} />;

  return (
    <div className="loader-screen bg-background-primary">
      <div className="loader-container"></div>
      <p className="loader-message">Securing your account...</p>
    </div>
  );
}
