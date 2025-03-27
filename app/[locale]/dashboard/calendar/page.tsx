import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { Calendar } from "@/components/calendar/Calendar";
import { ModernCard } from "@/components/ui/modern-card";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { CalendarIcon } from "lucide-react";

const CalendarPage = async () => {
  const session = await checkIfUserCompletedOnboarding(
    "/dashboard/calendar"
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
            <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Calendar</h1>
        </div>
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <ModernCard variant="purple" className="border-purple-200/50 dark:border-purple-800/30 overflow-x-auto">
        <main className="h-full w-full min-w-[300px]">
          <Calendar userId={session.user.id} />
        </main>
      </ModernCard>
    </div>
  );
};

export default CalendarPage;
