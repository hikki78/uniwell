import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { AssignedToMeContainer } from "@/components/assigned-to-me/AssignedToMeContainer";
import { ModernCard } from "@/components/ui/modern-card";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { ClipboardList } from "lucide-react";

const AssignedToMe = async () => {
  const session = await checkIfUserCompletedOnboarding(
    "/dashboard/assigned-to-me"
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
            <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Assigned To Me</h1>
        </div>
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <ModernCard variant="accent" className="border-purple-200/50 dark:border-purple-800/30">
        <main className="w-full">
          <AssignedToMeContainer userId={session.user.id} />
        </main>
      </ModernCard>
    </div>
  );
};

export default AssignedToMe;