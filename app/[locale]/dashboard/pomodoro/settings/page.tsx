import { SettingsContainer } from "@/components/pomodoro/SettingsContainer";
import { getUserPomodoroSettings } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";

const PomodoroSettings = async () => {
  const session = await checkIfUserCompletedOnboarding(`/dashboard/pomodoro`);

  const pomodoroSettings = await getUserPomodoroSettings(session.user.id);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pomodoro Settings</h1>
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl p-4 md:p-6 shadow-sm border border-border/40">
        <main className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
          <SettingsContainer pomodoroSettings={pomodoroSettings} />
        </main>
      </div>
    </div>
  );
};

export default PomodoroSettings;
