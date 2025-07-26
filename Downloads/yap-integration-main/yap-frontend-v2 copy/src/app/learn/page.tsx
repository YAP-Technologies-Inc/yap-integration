// Learn page
// This page serves as the main entry point for the learning section of the app.
import BottomNavBar from '@/components/layout/BottomNavBar';
import ProgressCard from '@/components/ui/ProgressCard';
import LearnedWordGrid from '@/components/lesson/LearnedWordGrid';

export default function Learn() {
  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col">
      <div className="px-6">
        <h1 className="text-2xl font-bold text-secondary pt-8 text-left">
          Learn
        </h1>

        <div className="mt-6 w-full">
          <ProgressCard />
        </div>

        <h2 className="text-2xl font-bold text-secondary pt-8 text-left">
          Daily Quiz
        </h2>

        <LearnedWordGrid />
      </div>

      <BottomNavBar />
    </div>
  );
}
