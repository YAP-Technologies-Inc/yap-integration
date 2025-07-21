// HeaderGreeting.tsx
// This component displays a personalized greeting in the dashboard header.
// It shows the user's first initial and a welcome message.
// Used in home page to greet the user and when starting lessons.
// Need to pass in className later for when its rendered differnt
import { mockUserProfile } from "@/mock/mockUser";

export default function HeaderGreeting() {
  const firstInitial = mockUserProfile.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-start w-full ">
      <div className="w-12 h-12 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
        <span className="text-white text-lg font-semibold">{firstInitial}</span>
      </div>

      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-[#2D1C1C] leading-tight">
          Welcome {mockUserProfile.name}
        </h1>
        <p className="text-sm text-[#5C4B4B] leading-snug">
          Hola, ¿cómo estás hoy?
        </p>
      </div>
    </div>
  );
}
