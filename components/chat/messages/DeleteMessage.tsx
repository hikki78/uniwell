"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { DeleteMessageSchema } from "@/schema/messageSchema";
import { useMessage } from "@/store/conversation/messages";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DeleteMessage = () => {
  const m = useTranslations("MESSAGES");
  const { toast } = useToast();
  const t = useTranslations("CHAT.DELETE_MESSAGE");

  const {
    messageToDelete,
    deleteMessage: deleteClientMessage,
    addMessage,
    setMessageToDelete,
    resortMessages,
  } = useMessage((state) => state);

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async () => {
      if (!messageToDelete) return;
      const deleteMessage: DeleteMessageSchema = {
        id: messageToDelete.id,
      };
      await axios.post(`/api/conversation/delete_message`, deleteMessage);
      setMessageToDelete(null);
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      if (!messageToDelete) return;

      addMessage(messageToDelete);
      resortMessages();

      toast({ title: m(error), variant: "destructive" });

      setMessageToDelete(null);
    },
    onMutate: () => {
      if (!messageToDelete) return;
      deleteClientMessage(messageToDelete.id);
    },
    mutationKey: ["deleteMessage", messageToDelete?.id],
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="hidden" id="trigger-delete"></button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("TITLE")}</AlertDialogTitle>
          <AlertDialogDescription>{t("DESC")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setMessageToDelete(null);
            }}
          >
            {t("BTN_CANCEL")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteMessage();
            }}
          >
            {t("BTN_DELETE")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
