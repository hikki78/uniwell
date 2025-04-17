"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExtendedMindMap } from "@/types/extended";
import { UserPermission } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Pencil, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next/link";
import { useState } from "react";

interface MindMapActionButtonsProps {
  mindMap: ExtendedMindMap;
  userRole: UserPermission | null;
  isSavedByUser: boolean;
}

export const MindMapActionButtons = ({
  mindMap,
  userRole,
  isSavedByUser,
}: MindMapActionButtonsProps) => {
  const m = useTranslations("MESSAGES");
  const t = useTranslations("MIND_MAP");
  const { toast } = useToast();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(isSavedByUser);

  const { mutate: toggleSaveMindMap, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/saved/mindMaps/toggleMindMap", {
        mindMapId: mindMap.id,
      });
    },
    onMutate: () => {
      setIsSaved(!isSaved);
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";
      setIsSaved(!isSaved); // Revert on error
      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: isSaved ? m("SUCCESS.MIND_MAP_UNSAVED") : m("SUCCESS.MIND_MAP_SAVED"),
      });
    },
    mutationKey: ["toggleSaveMindMap"],
  });

  const canEdit = userRole === "ADMIN" || userRole === "OWNER" || userRole === "CAN_EDIT";

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => toggleSaveMindMap()}
        variant="outline"
        size="sm"
        disabled={isPending}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaved ? t("REMOVE_FROM_FAVORITES") : t("ADD_TO_FAVORITES")}
      </Button>
      
      {canEdit && (
        <Button
          variant="default"
          size="sm"
          asChild
        >
          <Link href={`/dashboard/workspace/${mindMap.workspaceId}/mind-maps/mind-map/${mindMap.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            {t("EDIT")}
          </Link>
        </Button>
      )}
    </div>
  );
};
