"use client";
import yapLogo from "@/assets/YAP.webp";
import Image from "next/image";
export default function AuthLogo() {
  return (
    <div className="mt-2 flex justify-center z-10">
      <Image
        src={yapLogo}
        alt="YAP Logo"
        width={120}
        height={40}
        priority
        className="h-10 w-auto"
      />
    </div>
  );
}
