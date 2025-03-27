"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserHoverInfo } from "@/components/common/UserHoverInfoCard";
import { ExtendedTask } from "@/types/extended";
import { UserPermission } from "@prisma/client";
import { useFormatter, useTranslations } from "next-intl";
import { ReadOnlyEmoji } from "../../common/ReadOnlyEmoji";
import { useState } from "react";
import { Pencil, Save, Star } from "lucide-react";
import { TaskOptions } from "./TaskOptions";
import { ReadOnlyCalendar } from "./ReadOnlyCalendar";
import { LinkTag } from "../editable/tag/LinkTag";
import { AssignedToTaskSelector } from "../assignToTask/AssignedToTaskSelector";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next-intl/client";

interface Props {
  task: ExtendedTask;
  isSavedByUser: boolean;
  userRole: UserPermission | null;
}

export const ReadOnlyContent = ({ task, isSavedByUser, userRole }: Props) => {
  const [isSaved, setIsSaved] = useState(isSavedByUser);
  const t = useTranslations("TASK.EDITOR.READ_ONLY");
  const [updater] = useState(task.updatedBy);

  const format = useFormatter();
  const dateTime = new Date(task.updatedAt);
  const now = new Date();
  const m = useTranslations("MESSAGES");
  const { toast } = useToast();
  const router = useRouter();

  const { mutate: toggleSaveTask, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/saved/tasks/toggleTask", {
        taskId: task.id,
      });
    },
    onMutate: () => {
      setIsSaved(!isSaved);
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";
      setIsSaved(!isSaved); // Revert the state change
      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: isSaved ? m("SUCCESS.TASK_UNSAVED") : m("SUCCESS.TASK_SAVED"),
      });
    },
    mutationKey: ["toggleSaveTask"],
  });

  const canEdit = userRole && userRole !== "READ_ONLY";

  return (
    <Card>
      <CardContent className="py-4 sm:py-6 flex flex-col gap-10 relative">
        <div className="w-full flex flex-col sm:flex-row items-start sm:gap-4 gap-2">
          {" "}
          <ReadOnlyEmoji selectedEmoji={task.emoji} />
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex justify-between items-center">
              <div className="w-5/6">
                <p className="text-2xl font-semibold flex items-center gap-2">
                  {task.title ? task.title : t("NO_TITLE")}{" "}
                  {isSaved && <Star className="text-yellow-500" />}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => toggleSaveTask()}
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaved ? t("REMOVE_FROM_FAV") : t("ADD_TO_FAV")}
                </Button>
                
                {canEdit && (
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/workspace/${task.workspaceId}/tasks/task/${task.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {t("EDIT")}
                    </Link>
                  </Button>
                )}
                
                <div className="ml-2">
                  <TaskOptions
                    taskId={task.id}
                    workspaceId={task.workspaceId}
                    userRole={userRole}
                  />
                </div>
              </div>
            </div>
            <div className="w-full gap-1 flex flex-wrap flex-row">
              <AssignedToTaskSelector
                taskId={task.id}
                workspaceId={task.workspaceId}
              />
              <ReadOnlyCalendar
                from={task.taskDate?.from}
                to={task.taskDate?.to}
              />
              {task.tags &&
                task.tags.map((tag) => <LinkTag key={tag.id} tag={tag} />)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full flex items-center justify-center gap-2 text-xs">
        <div className="flex items-center">
          <p>{t("CREATOR_INFO")}</p>
          <UserHoverInfo user={task.creator} />
        </div>
        <Separator className="hidden h-4 sm:block" orientation="vertical" />
        <div className="flex items-center">
          <p>{t("EDITOR_INFO")}</p>
          <UserHoverInfo user={updater} />
          <p>{format.relativeTime(dateTime, now)}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
