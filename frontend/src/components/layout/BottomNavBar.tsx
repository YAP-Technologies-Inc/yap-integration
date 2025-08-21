// BottomNavBar.tsx
// This component renders the bottom navigation bar for the app.
// It includes links to Home, Learn, Progress, and Profile pages.
// Needs to be rendered on every page essentially

import { TablerSmartHome, TablerUser, PhWechatLogoLight } from '@/icons';

export default function BottomNavBar() {
  return (
    <div className="fixed w-full h-16 bottom-0 left-0 right-0 text-black bg-[#fdfbfa] z-50">
      <nav className="w-full lg:w-1/2 lg:mx-auto h-16 flex justify-around items-center">
        <a href="/home" className="flex flex-col items-center justify-center hover:cursor-pointer h-full px-4 lg:px-6">
          <TablerSmartHome className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Home</span>
        </a>

        <a href="/spanish-teacher" className="flex flex-col items-center justify-center hover:cursor-pointer h-full px-4 lg:px-6">
          <PhWechatLogoLight className="text-[#999595] w-7 h-7 text-bold" />
          <span className="text-[#999595] text-sm">Tutor</span>
        </a>
        {/*
        <a href="/progress" className="flex flex-col items-center justify-center hover:cursor-pointer h-full px-4 lg:px-6">
          <TablerChartLine className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Progress</span>
        </a> */}
        <a href="/profile" className="flex flex-col items-center justify-center hover:cursor-pointer hover: h-full px-4 lg:px-6">
          <TablerUser className="text-[#999595] w-6 h-6" />
          <span className="text-[#999595] text-sm">Profile</span>
        </a>
      </nav>
    </div>
  );
}
