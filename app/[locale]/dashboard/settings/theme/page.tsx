import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { Theme } from "@/components/settings/theme/Theme";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const ThemeSettings = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings");

  return (
    <>
      <div className="flex justify-end p-2 mt-2">
        {/* @ts-ignore */}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <Theme />
    </>
  );
};

export default ThemeSettings;
