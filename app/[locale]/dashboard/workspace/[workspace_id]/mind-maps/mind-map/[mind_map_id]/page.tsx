import { MindMap } from "@/components/mindMaps/MindMap";
import { MindMapActionButtons } from "@/components/mindMaps/MindMapActionButtons";
import { MindMapPreviewCardWrapper } from "@/components/mindMaps/preview/MindMapPreviewCardWrapper";
import { WorkspacePageHeader } from "@/components/workspacePages/WorkspacePageHeader";
import { AutosaveIndicatorProvider } from "@/context/AutosaveIndicator";
import { AutoSaveMindMapProvider } from "@/context/AutoSaveMindMap";
import { getMindMap, getUserWorkspaceRole, getWorkspace } from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
    mind_map_id: string;
  };
}

const MindMapPage = async ({
  params: { workspace_id, mind_map_id },
}: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/tasks/task/${mind_map_id}`
  );

  const [workspace, userRole, mindMap] = await Promise.all([
    getWorkspace(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
    getMindMap(mind_map_id, session.user.id),
  ]);

  if (!workspace || !userRole || !mindMap) notFound();

  const canEdit = userRole === "ADMIN" || userRole === "OWNER" ? true : false;

  const isSavedByUser =
    mindMap.savedMindMaps?.find(
      (mindMap) => mindMap.userId === session.user.id
    ) !== undefined;

  return (
    <AutosaveIndicatorProvider>
      <AutoSaveMindMapProvider>
        <div className="container mx-auto px-4 py-6">
          <WorkspacePageHeader
            title={mindMap.title}
            emoji={mindMap.emoji}
            workspace={workspace}
            userRole={userRole}
            userId={session.user.id}
            actions={
              <MindMapActionButtons
                mindMap={mindMap}
                userRole={userRole}
                isSavedByUser={isSavedByUser}
              />
            }
          />
          
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl p-4 md:p-6 shadow-sm border border-border/40">
            <main className="flex flex-col gap-4 w-full overflow-x-auto">
              <MindMapPreviewCardWrapper
                mindMap={mindMap}
                userRole={userRole}
                isSavedByUser={isSavedByUser}
              >
                <MindMap
                  initialInfo={mindMap}
                  workspaceId={workspace_id}
                  canEdit={false}
                  initialActiveTags={mindMap.tags}
                />
              </MindMapPreviewCardWrapper>
            </main>
          </div>
        </div>
      </AutoSaveMindMapProvider>
    </AutosaveIndicatorProvider>
  );
};

export default MindMapPage;
