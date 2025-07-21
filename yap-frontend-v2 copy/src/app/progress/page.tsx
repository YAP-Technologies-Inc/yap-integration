import BottomNavBar from '@/components/layout/BottomNavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';

export default function Progress() {
  // Mock data for daily streak, words learned, and badge progress
  const dailyStreak = 12;
  const wordsLearned = 37;
  const badgeGoal = 100;

  const badgeProgressPercent = Math.min((wordsLearned / badgeGoal) * 100, 100);

  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col pb-24">
      <div className="px-6">
        <h1 className="text-2xl font-bold text-secondary pt-8 text-left">
          Progress
        </h1>
      </div>

      {/* Earnings Section */}
      <div className="px-6 pt-6">
        <h2 className="text-xl font-bold text-secondary mb-2">Your Earnings</h2>
        <BalanceCard />
      </div>

      {/* Progress Section */}
      <div className="px-6 pt-8">
        <h2 className="text-xl font-bold text-secondary mb-4">Your Progress</h2>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              <div>
                <p className="text-sm text-secondary">Days streak</p>
                <p className="font-bold text-secondary text-md">
                  {dailyStreak}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>📘</span>
              <div>
                <p className="text-sm text-secondary">Words learned</p>
                <p className="font-bold  text-secondary text-md">
                  {wordsLearned}
                </p>
              </div>
            </div>
          </div>

          {/* Grayed Out Badge Section, will do something with the space later */}
          <div className="opacity-50">
            <div className="text-sm text-gray-500 mb-1">🎖️ Coming soon</div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gray-400 h-full transition-all duration-300"
                style={{ width: `${badgeProgressPercent}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {wordsLearned}/{badgeGoal}
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
