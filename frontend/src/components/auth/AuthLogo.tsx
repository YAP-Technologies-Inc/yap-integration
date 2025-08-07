// components/auth/AuthLogo.tsx
export default function AuthLogo({ variant = "default" }: { variant?: "default" | "red" }) {
  return (
    <img
      src={variant === "red" ? "/assets/yapred.png" : "/assets/yapwhite.png"}
      alt="YAP Logo"
      className="h-[48px] w-auto"
    />
  );
}
