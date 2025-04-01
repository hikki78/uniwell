import { TaskContainer } from "@/components/tasks/editable/container/TaskContainer";
import { TaskActionButtons } from "@/components/tasks/readOnly/TaskActionButtons";
import { ReadOnlyContent } from "@/components/tasks/readOnly/ReadOnlyContent";
import { WorkspacePageHeader } from "@/components/workspacePages/WorkspacePageHeader";
import { getTask, getUserWorkspaceRole, getWorkspace } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
    task_id: string;
  };
}

const Task = async ({ params: { workspace_id, task_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/tasks/task/${task_id}`
  );

  const [workspace, userRole, task] = await Promise.all([
    getWorkspace(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
    getTask(task_id, session.user.id),
  ]);

  if (!workspace || !userRole || !task) notFound();

  const isSavedByUser =
    task.savedTask?.find((task) => task.userId === session.user.id) !==
    undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      <WorkspacePageHeader
        title={task.title}
        emoji={task.emoji}
        workspace={workspace}
        userRole={userRole}
        userId={session.user.id}
        actions={
          <TaskActionButtons
            taskId={task.id}
            workspaceId={workspace.id}
            userRole={userRole}
            isSaved={isSavedByUser}
          />
        }
      />
      
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl p-4 md:p-6 shadow-sm border border-border/40">
        <main className="flex flex-col gap-4 w-full">
          <ReadOnlyContent
            task={task}
            isSavedByUser={isSavedByUser}
            userRole={userRole}
          />
        </main>
      </div>
    </div>
  );
};

export default Task;
