import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { MindMap } from "@/components/mindMaps/MindMap";
import { WorkspaceTab } from "@/components/settings/workspace/WorkspaceTab";
import { getWorkspaceSettings } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
  };
}

const Workspace = async ({ params: { workspace_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/settings/workplace/${workspace_id}`
  );
  const workspace = await getWorkspaceSettings(workspace_id, session.user.id);
  if (!workspace) notFound();
  const user = workspace.subscribers.find(
    (subscriber) => subscriber.user.id === session.user.id
  );

  return (
    <>
      <div className="flex items-center container mx-auto gap-2 justify-start">
        {(user?.userRole === "ADMIN" || user?.userRole === "OWNER") && (
          <InviteUsers workspace={workspace} />
        )}
        <AddTaskShortcut userId={session.user.id} />
      </div>
      <main className="flex flex-col gap-2">
        <WorkspaceTab workspace={workspace} workspaceId={workspace.id} />
      </main>
    </>
  );
};

export default Workspace;
