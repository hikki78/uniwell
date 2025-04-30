import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { SecurityCard } from "@/components/settings/security/SecurityCard";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const SecuritySettings = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings");

  return (
    <>
      <div className="flex justify-end p-2 mt-2">
        {/* @ts-ignore */}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <SecurityCard />
    </>
  );
};

export default SecuritySettings;
