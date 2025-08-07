"use client";

interface AuthCardProps {
  onEmailClick: () => void;
  hideFooter?: boolean;
}

export default function AuthCard({
  onEmailClick,
  hideFooter = false,
}: AuthCardProps) {
  return (
    <div className="fixed inset-0 z-0">
      <img
        src="/assets/authbackground.png"
        alt="Auth background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center w-full h-full">
        <div className="flex items-center justify-center flex-1 ">
          <img
            src="/assets/yapwhite.png"
            alt="YAP Logo"
            className="h-50 w-auto"
          />
        </div>

        <div
          className={[
            "w-full px-6 pb-2 rounded-t-3xl mt-auto sm:max-w-md",
            "transform transition-transform duration-300 ease-in-out",
            hideFooter ? "translate-y-full" : "translate-y-0",
          ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center h-full lg:pb-20 gap-6">
            <button
              onClick={onEmailClick}
              className="w-full bg-background-primary text-secondary font-semibold py-4 rounded-full shadow-md flex items-center justify-center text-lg gap-2 hover:cursor-pointer lg:py-4"
            >
              <span className="flex items-center justify-center gap-2">
                <img src="/assets/privy.png" alt="Privy Logo" className="h-6" />
                Sign in to YAP
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
