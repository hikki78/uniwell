import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { PomodoContainer } from "@/components/pomodoro/timer/PomodoroContainer";
import { getUserPomodoroSettings } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { notFound } from "next/navigation";

const Pomodoro = async () => {
  const session = await checkIfUserCompletedOnboarding(`/dashboard/pomodoro`);

  const pomodoroSettings = await getUserPomodoroSettings(session.user.id);
  if (!pomodoroSettings) notFound();

  return (
    <>
      {/* @ts-ignore */}
      <DashboardHeader />
      <div className="flex justify-end p-2 mt-2">
        {/* @ts-ignore */}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <main className="flex flex-col gap-2 h-full items-center">
        <PomodoContainer pomodoroSettings={pomodoroSettings} />
      </main>
    </>
  );
};

export default Pomodoro;
