"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserPermission } from "@prisma/client";
import { MessagesSquare } from "lucide-react";
import { PermissionIndicator } from "@/components/workspaceMainPage/shortcuts/permissionIndicator/Permissionindicator";
import { ShortcutContainerLinkItem } from "./ShortcutContainerLinkItem";
import { ExtendedWorkspace } from "@/types/extended";
import { WorkspaceLeaderboard } from "../leaderboard/WorkspaceLeaderboard";

interface Props {
  workspace: ExtendedWorkspace;
  userRole: UserPermission | null;
}

export const ShortcutContainer = ({ workspace, userRole }: Props) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-3">Workspace Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <PermissionIndicator
              userRole={userRole}
              workspaceName={workspace.name}
            />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <ShortcutContainerLinkItem
              userRole={userRole}
              Icon={MessagesSquare}
              title="Chat"
              href={`/dashboard/workspace/${workspace.id}/chat/${workspace.conversation.id}`}
              className="w-full h-14 text-sm flex justify-center items-center"
              iconSize={18}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
