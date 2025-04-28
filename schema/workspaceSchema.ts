import { z } from "zod";

export const color = z.enum([
  "PURPLE",
  "RED",
  "GREEN",
  "BLUE",
  "PINK",
  "YELLOW",
  "ORANGE",
  "CYAN",
  "LIME",
  "EMERALD",
  "INDIGO",
  "FUCHSIA",
]);

const workspaceName = z
  .string()
  .min(2, "SCHEMA.WORKSPACE.SHORT")
  .max(20, "SCHEMA.WORKSPACE.LONG")
  .refine((username) => /^[a-zA-Z0-9]+$/.test(username), {
    message: "SCHEMA.WORKSPACE.SPECIAL_CHARS",
  });

export const workspaceSchema = z.object({
  workspaceName,
});

export const apiWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(4, "SCHEMA.WORKSPACE.SHORT")
    .refine((username) => /^[a-zA-Z0-9]+$/.test(username), {
      message: "SCHEMA.WORKSPACE.SPECIAL_CHARS",
    }),
});

export const workspacePicture = z.object({});

export const apiWorkspaceDeletePicture = z.object({
  id: z.string(),
});

export const apiWorkspacePicture = z.object({
  picture: z.string(),
  id: z.string(),
});

export const workspaceEditData = z.object({ workspaceName, color });

export const apiWorkspaceEditData = z.object({
  id: z.string(),
  workspaceName,
  color,
});

export const id = z.string();

export const apiWorkspaceDelete = z.object({
  id,
  workspaceName,
});

export type ApiWorkspaceDelete = z.infer<typeof apiWorkspaceDelete>;

export type ApiWorkspacePicture = z.infer<typeof apiWorkspacePicture>;

export type WorkspaceEditData = z.infer<typeof workspaceEditData>;
export type ApiWorkspaceEditData = z.infer<typeof apiWorkspaceEditData>;

export type WorkspacePicture = z.infer<typeof workspacePicture>;

export type ApiWorkspaceSchema = z.infer<typeof apiWorkspaceSchema>;

export type WorkspaceSchema = z.infer<typeof workspaceSchema>;
