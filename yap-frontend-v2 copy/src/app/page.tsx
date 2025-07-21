"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import yapLogo from "../assets/YAP.png";

export default function SplashPage() {
  const router = useRouter();

  // Redirect to the auth page after a short delay
  // This simulates a splash screen effect before showing the auth options.
  // Maybe replaced with a more elaborate one that ensures the app is ready.
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/auth");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  // Disable scrolling while the splash screen is active
  // This prevents the user from scrolling during the splash screen display.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-primary">
      <img src={yapLogo.src} alt="YAP Logo" width={160} height={160} />
    </div>
  );
}
