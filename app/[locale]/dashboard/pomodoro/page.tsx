import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { PomodoContainer } from "@/components/pomodoro/timer/PomodoroContainer";
import { ModernCard } from "@/components/ui/modern-card";
import { getUserPomodoroSettings } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { Timer } from "lucide-react";
import { notFound } from "next/navigation";

const Pomodoro = async () => {
  const session = await checkIfUserCompletedOnboarding(`/dashboard/pomodoro`);

  const pomodoroSettings = await getUserPomodoroSettings(session.user.id);
  if (!pomodoroSettings) notFound();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
            <Timer className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Pomodoro Timer</h1>
        </div>
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <ModernCard variant="accent" className="border-purple-200/50 dark:border-purple-800/30">
        <main className="flex flex-col gap-4 items-center w-full max-w-3xl mx-auto">
          <PomodoContainer pomodoroSettings={pomodoroSettings} />
        </main>
      </ModernCard>
    </div>
  );
};

export default Pomodoro;
