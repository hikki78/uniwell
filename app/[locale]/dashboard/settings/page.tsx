import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { AccountInfo } from "@/components/settings/account/AccountInfo";
import { DeleteAccount } from "@/components/settings/account/DeleteAccount";
import { Heading } from "@/components/settings/account/Heading";
import { Separator } from "@/components/ui/separator";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const Settings = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/settings");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl p-4 md:p-6 shadow-sm border border-border/40">
        <main className="w-full max-w-4xl mx-auto">
          <Heading />
          <AccountInfo session={session} />
          <div className="p-4 sm:p-6">
            <Separator />
          </div>
          <DeleteAccount userEmail={session.user.email!} />
        </main>
      </div>
    </div>
  );
};

export default Settings;
