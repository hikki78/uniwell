"use client";

import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { Workspace, UserPermission } from "@prisma/client";
import { ReactNode } from "react";
import { changeCodeToEmoji } from "@/lib/changeCodeToEmoji";

interface WorkspacePageHeaderProps {
  title: string;
  emoji: string;
  workspace: Workspace;
  userRole: UserPermission | null;
  userId: string;
  actions?: ReactNode;
}

export const WorkspacePageHeader = ({
  title,
  emoji,
  workspace,
  userRole,
  userId,
  actions
}: WorkspacePageHeaderProps) => {
  const canInvite = userRole === "ADMIN" || userRole === "OWNER";
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{changeCodeToEmoji(emoji)}</span>
        <h1 className="text-xl md:text-2xl font-bold">
          {title || "UNTITLED"}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {canInvite && <InviteUsers workspace={workspace} />}
        <AddTaskShortcut userId={userId} />
      </div>
    </div>
  );
};
