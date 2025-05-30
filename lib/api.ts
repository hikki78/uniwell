import {
  ExtendedMessage,
  ExtendedMindMap,
  ExtendedTask,
  ExtendedWorkspace,
  HomeRecentActivity,
  SettingsWorkspace,
} from "@/types/extended";
import {
  MindMap,
  PomodoroSettings,
  UserPermission,
  Workspace,
} from "@prisma/client";
import { notFound } from "next/navigation";
import { ACTIVITY_PER_PAGE } from "./constants";

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    // On the server
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  }
  // On the client
  return "";
}


export const getWorkspace = async (workspace_id: string, userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/workspace_details/${workspace_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<Workspace>;
};

export const getWorkspaces = async (userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/user_workspaces?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Workspace[]>;
};

export const getUserAdminWorkspaces = async (userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/user_admin_workspaces?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Workspace[]>;
};

export const getWorkspaceSettings = async (
  workspace_id: string,
  userId: string
) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/settings/${workspace_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<SettingsWorkspace>;
};

export const getWorkspaceWithChatId = async (
  workspace_id: string,
  userId: string
) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/workspace_with_chat/${workspace_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedWorkspace>;
};

export const getInitialMessages = async (userId: string, chatId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/conversation/get/initial_messages?userId=${userId}&chatId=${chatId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedMessage[]>;
};

export const getUserWorkspaceRole = async (
  workspace_id: string,
  userId: string
) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/workspace/get/user_role?workspaceId=${workspace_id}&userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<UserPermission>;
};

export const getTask = async (task_id: string, userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/task/get/details/${task_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedTask>;
};

export const getMindMap = async (mind_map_id: string, userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/mind_maps/get/details/${mind_map_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedMindMap>;
};

export const getUserPomodoroSettings = async (userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/pomodoro/get_settings?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<PomodoroSettings>;
};

export const getInitialHomeRecentActivity = async (userId: string) => {
  const res = await fetch(
    `${getApiBaseUrl()}/api/home-page/get?userId=${userId}&page=${1}&take=${ACTIVITY_PER_PAGE}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<HomeRecentActivity[]>;
};
