import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { LeaveWorkspace } from "@/components/workspaceMainPage/shortcuts/leaveWorkspace/LeaveWorkspace";
import { MindMap } from "@/components/mindMaps/MindMap";
import { PermissionIndicator } from "@/components/workspaceMainPage/shortcuts/permissionIndicator/Permissionindicator";
import { FilterContainer } from "@/components/workspaceMainPage/filter/FilterContainer";
import { ShortcutContainer } from "@/components/workspaceMainPage/shortcuts/ShortcutContainer";
import {
  getInitialMessages,
  getUserWorkspaceRole,
  getWorkspace,
  getWorkspaceWithChatId,
} from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { FilterByUsersAndTagsInWorkspaceProvider } from "@/context/FilterByUsersAndTagsInWorkspace";
import { RecentActivityContainer } from "@/components/workspaceMainPage/recentActivity/RecentActivityContainer";
import { notFound, redirect } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";

interface Params {
  params: {
    workspace_id: string;
    chat_id: string;
  };
}

const Chat = async ({ params: { workspace_id, chat_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/chat/${chat_id}`
  );

  const [workspace, userRole, initialMessages] = await Promise.all([
    getWorkspaceWithChatId(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
    getInitialMessages(session.user.id, chat_id),
  ]);

  if (!workspace) return notFound();

  const conversationId = workspace.conversation.id;

  if (conversationId !== chat_id)
    redirect("/dashboard/errors?error=no-conversation");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Chat</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(userRole === "ADMIN" || userRole === "OWNER") && (
            <InviteUsers workspace={workspace} />
          )}
          <AddTaskShortcut userId={session.user.id} />
        </div>
      </div>
      
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl p-4 md:p-6 shadow-sm border border-border/40 h-[calc(100vh-12rem)]">
        <main className="h-full w-full">
          <ChatContainer
            chatId={conversationId}
            workspaceId={workspace.id}
            initialMessages={initialMessages ? initialMessages : []}
            sessionUserId={session.user.id}
            workspaceName={workspace?.name}
          />
        </main>
      </div>
    </div>
  );
};

export default Chat;
