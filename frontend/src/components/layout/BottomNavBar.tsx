// BottomNavBar.tsx
// This component renders the bottom navigation bar for the app.
// It includes links to Home, Learn, Progress, and Profile pages.
// Needs to be rendered on every page essentially 

import {
  TablerSmartHome,
  TablerUser,
  TablerFileText,
  TablerChartLine,
} from "@/icons";

export default function BottomNavBar() {
  return (
    <div className="fixed w-full h-16 bottom-0 left-0 right-0 text-black">
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-background-primary/99 z-50 flex justify-around items-center">
        <a href="/home" className="flex flex-col items-center hover:cursor-pointer">
          <TablerSmartHome className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Home</span>
        </a>

        {/* <a href="/learn" className="flex flex-col items-center hover:cursor-pointer">
          <TablerFileText className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Learn</span>
        </a>
        <a href="/progress" className="flex flex-col items-center hover:cursor-pointer">
          <TablerChartLine className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Progress</span>
        </a> */}
        <a href="/profile" className="flex flex-col items-center hover:cursor-pointer">
          <TablerUser className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Profile</span>
        </a>
      </nav>
    </div>
  );
}
