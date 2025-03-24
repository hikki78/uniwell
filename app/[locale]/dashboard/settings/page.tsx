import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { AccountInfo } from "@/components/settings/account/AccountInfo";
import { DeleteAccount } from "@/components/settings/account/DeleteAccount";
import { Heading } from "@/components/settings/account/Heading";
import { Separator } from "@/components/ui/separator";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const Settings = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings");

  return (
    <>
      {/* @ts-ignore */}
      <DashboardHeader />
      <div className="flex justify-end p-2 mt-2">
        {/* @ts-ignore */}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <main>
        <Heading />
        <AccountInfo session={session} />
        <div className="p-4 sm:p-6">
          <Separator />
        </div>
        <DeleteAccount userEmail={session.user.email!} />
      </main>
    </>
  );
};

export default Settings;
