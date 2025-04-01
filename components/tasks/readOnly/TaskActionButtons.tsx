"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPermission } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Pencil, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next/link";
import { useState } from "react";

interface TaskActionButtonsProps {
  taskId: string;
  workspaceId: string;
  userRole: UserPermission | null;
  isSaved: boolean;
}

export const TaskActionButtons = ({
  taskId,
  workspaceId,
  userRole,
  isSaved: initialIsSaved,
}: TaskActionButtonsProps) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const m = useTranslations("MESSAGES");
  const t = useTranslations("TASK.EDITOR.READ_ONLY");
  const { toast } = useToast();
  const router = useRouter();

  const { mutate: toggleSaveTask, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/saved/tasks/toggleTask", {
        taskId,
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
          <Link href={`/dashboard/workspace/${workspaceId}/tasks/task/${taskId}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            {t("EDIT")}
          </Link>
        </Button>
      )}
    </div>
  );
};
