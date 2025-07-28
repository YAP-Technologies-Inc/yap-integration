"use client";

import { TablerChevronRight } from "@/icons";
import AuthLogo from "@/components/auth/AuthLogo";
import group from "@/assets/group.webp";
import Image from "next/image";

interface AuthCardProps {
  onEmailClick: () => void;
  hideFooter?: boolean;
}

export default function AuthCard({
  onEmailClick,
  hideFooter = false,
}: AuthCardProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background-secondary justify-start bg-quaternary">
      <AuthLogo />
 
      <div className="w-full max-w-md pt-20 px-6 overflow-hidden">
        <Image
          src={group}
          alt="Group"
          className=""
          width={320}
          height={240}
          priority
          placeholder="blur"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            contentVisibility: "auto",
          }}
        />
      </div>

      <div
        className={[
          "w-full px-6 h-[30vh] rounded-t-3xl shadow-lg mt-auto sm:max-w-md",
          "transform transition-transform duration-300 ease-in-out",
          hideFooter ? "translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-center h-full">
          <button
            onClick={onEmailClick}
            className="w-full bg-background-primary text-secondary font-semibold py-4 rounded-full shadow-md flex items-center justify-center gap-2 text-lg"
          >
            Continue with Privy
            <TablerChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
