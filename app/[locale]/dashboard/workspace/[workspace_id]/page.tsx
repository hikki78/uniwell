import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { LeaveWorkspace } from "@/components/workspaceMainPage/shortcuts/leaveWorkspace/LeaveWorkspace";
import { FilterContainer } from "@/components/workspaceMainPage/filter/FilterContainer";
import { ShortcutContainer } from "@/components/workspaceMainPage/shortcuts/ShortcutContainer";
import { WorkspaceLeaderboard } from "@/components/workspaceMainPage/leaderboard/WorkspaceLeaderboard";
import { ModernCard } from "@/components/ui/modern-card";
import {
  getUserWorkspaceRole,
  getWorkspace,
  getWorkspaceWithChatId,
} from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { FilterByUsersAndTagsInWorkspaceProvider } from "@/context/FilterByUsersAndTagsInWorkspace";
import { RecentActivityContainer } from "@/components/workspaceMainPage/recentActivity/RecentActivityContainer";
import { Briefcase } from "lucide-react";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
  };
}

const Workspace = async ({ params: { workspace_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}`
  );

  const [workspace, userRole] = await Promise.all([
    getWorkspaceWithChatId(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
  ]);

  if (!workspace || !userRole) notFound();

  return (
    <FilterByUsersAndTagsInWorkspaceProvider>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">{workspace.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1 ml-9">Workspace</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {(userRole === "ADMIN" || userRole === "OWNER") && (
              <InviteUsers workspace={workspace} />
            )}
            {userRole !== "OWNER" && <LeaveWorkspace workspace={workspace} />}
          </div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/50 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden relative mb-6">
          <div className="relative flex items-center gap-4">
            <div className="bg-white/30 dark:bg-white/10 rounded-full p-3 backdrop-blur-sm">
              <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200">{workspace.name}</h2>
              <p className="text-purple-600/80 dark:text-purple-300/80">Collaborate and organize your tasks</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left Side (8/12) */}
          <div className="lg:col-span-8">
            <ModernCard variant="purple" className="border-purple-200/50 dark:border-purple-800/30">
              <main className="flex flex-col gap-6 w-full">
                <ShortcutContainer workspace={workspace} userRole={userRole} />
                <FilterContainer sessionUserId={session.user.id} />
                <RecentActivityContainer
                  userId={session.user.id}
                  workspaceId={workspace.id}
                />
              </main>
            </ModernCard>
          </div>
          
          {/* Leaderboard - Right Side (4/12) */}
          <div className="lg:col-span-4">
            <ModernCard variant="accent" className="border-purple-200/50 dark:border-purple-800/30">
              <WorkspaceLeaderboard workspaceId={workspace.id} />
            </ModernCard>
          </div>
        </div>
      </div>
    </FilterByUsersAndTagsInWorkspaceProvider>
  );
};

export default Workspace;
