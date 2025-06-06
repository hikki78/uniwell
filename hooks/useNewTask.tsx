"use client";

import { useTranslations } from "next-intl";
import { useToast } from "./use-toast";
import { useRouter } from "next-intl/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Task } from "@prisma/client";

export const useNewTask = (workspaceId: string) => {
  const m = useTranslations("MESSAGES");

  const { toast } = useToast();
  const router = useRouter();

  const { mutate: newTask, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/task/new`, {
        workspaceId,
      });

      return data;
    },
    onSuccess: (data: Task) => {
      toast({
        title: "Task Added",
      });
      router.push(
        `/dashboard/workspace/${workspaceId}/tasks/task/${data.id}/edit`
      );
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    mutationKey: ["newTask"],
  });

  return { newTask, isPending };
};
