"use client";

import { useChangeCodeToEmoji } from "@/hooks/useChangeCodeToEmoji";
import { UserPermission } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { HoverCard, HoverCardContent } from "../../../ui/hover-card";
import { Button } from "../../../ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  userRole: UserPermission | null;
  workspaceName: string;
}

export const PermissionIndicator = ({ userRole, workspaceName }: Props) => {
  const userRoleEmojis = useChangeCodeToEmoji(
    "1f432",
    "1f60e",
    "1f920",
    "1f913"
  );
  const [open, setOpen] = useState(false);
  const t = useTranslations("PERMISSION_INDICATOR");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={250} closeDelay={250}>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full h-14 text-sm flex justify-between items-center px-4"
          >
            <span className="font-medium">
              {userRole === "OWNER" && "Owner"}
              {userRole === "ADMIN" && "Admin"}
              {userRole === "CAN_EDIT" && "Editor"}
              {userRole === "READ_ONLY" && "Viewer"}
            </span>
            <span className="flex items-center gap-2">
              {userRole === "OWNER" && <span className="text-2xl">{userRoleEmojis[0]}</span>}
              {userRole === "ADMIN" && <span className="text-2xl">{userRoleEmojis[1]}</span>}
              {userRole === "CAN_EDIT" && <span className="text-2xl">{userRoleEmojis[2]}</span>}
              {userRole === "READ_ONLY" && <span className="text-2xl">{userRoleEmojis[3]}</span>}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {" "}
              {t("TITLE")}{" "}
              {userRole === "OWNER" && (
                <span className="text-primary">
                  {t("ROLES.OWNER")} {userRoleEmojis[0]}
                </span>
              )}
              {userRole === "ADMIN" && (
                <span className="text-primary">
                  {t("ROLES.ADMIN")} {userRoleEmojis[1]}
                </span>
              )}
              {userRole === "CAN_EDIT" && (
                <span className="text-primary">
                  {t("ROLES.EDITOR")} {userRoleEmojis[2]}
                </span>
              )}
              {userRole === "READ_ONLY" && (
                <span className="text-primary">
                  {t("ROLES.READ_ONLY")} {userRoleEmojis[3]}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {t("DESC", { workspace: workspaceName })}{" "}
              {userRole === "OWNER" && <>{t("ROLES.OWNER")}</>}
              {userRole === "ADMIN" && <>{t("ROLES.ADMIN")}</>}
              {userRole === "CAN_EDIT" && <>{t("ROLES.EDITOR")}</>}
              {userRole === "READ_ONLY" && <>{t("ROLES.READ_ONLY")}</>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              {userRole === "OWNER" && <>{t("ROLES_DESC.OWNER")}</>}
              {userRole === "ADMIN" && <>{t("ROLES_DESC.ADMIN")}</>}
              {userRole === "CAN_EDIT" && <>{t("ROLES_DESC.EDITOR")}</>}
              {userRole === "READ_ONLY" && <>{t("ROLES_DESC.READ_ONLY")}</>}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              className="w-full text-white"
              type="submit"
              size={"lg"}
            >
              {t("BTN")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </HoverCard>
    </Dialog>
  );
};
