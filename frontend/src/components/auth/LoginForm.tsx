"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TablerChevronLeft, TablerEye, TablerEyeOff } from "@/icons";
import AuthLogo from "@/components/auth/AuthLogo";

interface EmailFormProps {
  onBack: () => void;
  onSwitch: () => void;
}

export default function LoginForm({ onBack }: EmailFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", formData);
  };

  return (
    <div className="min-h-screen w-full bg-background-primary px-6 relative flex flex-col justify-start items-center">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
      >
        <div className="mt-2">
          <TablerChevronLeft />
        </div>
      </button>

      <AuthLogo />

      {/* Title */}
      <div className="mt-6 mb-4 text-center">
        <h2 className="text-2xl font-bold text-secondary">Sign in</h2>
        <p className="text-base text-secondary mt-1">
          Welcome back! Enter your credentials to continue.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
        id="login-form"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white shadow-sm border border-gray-200 placeholder-[#A59C9C] text-secondary outline-none"
          required
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white shadow-sm border border-gray-200 placeholder-[#A59C9C] text-secondary outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary"
          >
            {showPassword ? (
              <TablerEyeOff className="w-5 h-5" />
            ) : (
              <TablerEye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="w-full flex justify-end mt-1">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-secondary underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          form="login-form"
          className="w-full bg-secondary text-white font-semibold py-3 rounded-full shadow-md mt-4"
        >
          Next
        </button>
      </form>
    </div>
  );
}
