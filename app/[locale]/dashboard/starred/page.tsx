import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { StarredContainer } from "@/components/starred/StarredContainer";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";

const Starred = async () => {
  const session = await checkIfUserCompletedOnboarding("/dashboard/starred");

  return (
    <>
      {/* @ts-ignore */}
      <DashboardHeader />
      <div className="flex justify-end p-2 mt-2">
        {/* @ts-ignore */}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <main>
        <StarredContainer userId={session.user.id} />
      </main>
    </>
  );
};

export default Starred;
