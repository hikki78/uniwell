"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/ui/loadingState";
import Warning from "@/components/ui/warning";
import { useToast } from "@/hooks/use-toast";
import { UserPermission } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MoreHorizontal, Pencil, Star, StarOff, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next/link";
import { useState } from "react";

interface Props {
  taskId: string;
  workspaceId: string;
  userRole: UserPermission | null;
}

export const TaskOptions = ({
  taskId,
  workspaceId,
  userRole,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const m = useTranslations("MESSAGES");
  const t = useTranslations("TASK.EDITOR.READ_ONLY");
  const { toast } = useToast();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate: deleteTask, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/task/delete", {
        workspaceId,
        taskId,
      });
    },
    onSuccess: () => {
      toast({
        title: m("SUCCESS.TASK_DELETED"),
      });

      queryClient.invalidateQueries(["getWorkspaceShortcuts"] as any);

      router.push(`/dashboard/workspace/${workspaceId}`);
      router.refresh();
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    mutationKey: ["deleteTask"],
  });


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="text-primary hover:text-primary"
            variant={"ghost"}
            size={"icon"}
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end" sideOffset={-8}>
            {userRole && userRole !== "READ_ONLY" && (
              <DialogTrigger className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <Trash size={16} className="mr-2" />
                  {t("DELETE")}
                </DropdownMenuItem>
              </DialogTrigger>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("DIALOG.TITLE")}</DialogTitle>
          </DialogHeader>
          <Warning>
            <p>{t("DIALOG.DESC")}</p>
          </Warning>

          <Button
            size={"lg"}
            variant={"destructive"}
            onClick={() => {
              deleteTask();
            }}
          >
            {isPending ? (
              <LoadingState loadingText={t("DIALOG.BTN_PENDING")} />
            ) : (
              t("DIALOG.BTN_DELETE")
            )}
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
