// BottomNavBar.tsx
// This component renders the bottom navigation bar for the app.
// It includes links to Home, Learn, Progress, and Profile pages.
// Needs to be rendered on every page essentially 

import {
  TablerHome,
  TablerUser,
  TablerFileText,
  TablerChartLine,
} from "@/icons";

export default function BottomNavBar() {
  return (
    <div className="fixed w-full h-16 bottom-0 left-0 right-0  text-black ">
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-background-primary z-50 flex justify-around items-center">
        <div className="flex flex-col items-center">
          <TablerHome className="text-[#999595] w-6 h-6" />
          <a href="/home" className="text-[#999595] text-sm">
            Home
          </a>
        </div>

        <div className="flex flex-col items-center">
          <TablerFileText className="text-[#999595] w-6 h-6" />
          <a href="/learn" className="text-[#999595] text-sm">
            Learn
          </a>
        </div>
        <div className="flex flex-col items-center">
          <TablerChartLine className="text-[#999595] w-6 h-6" />
          <a href="/progress" className="text-[#999595] text-sm">
            Progress
          </a>
        </div>
        <div className="flex flex-col items-center">
          <TablerUser className="text-[#999595] w-6 h-6" />
          <a href="/profile" className="text-[#999595] text-sm">
            Profile
          </a>
        </div>
      </nav>
    </div>
  );
}
