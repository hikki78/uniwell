"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { UserPermission } from "@prisma/client";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  Icon: LucideIcon;
  userRole: UserPermission | null;
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  iconSize?: number;
}

export const ShortcutContainerBtnItem = ({
  Icon,
  title,
  userRole,
  isLoading,
  onClick,
  className,
  iconSize = 16
}: Props) => {
  return (
    <Button
      disabled={isLoading}
      onClick={onClick}
      variant={"outline"}
      className={`text-sm flex justify-center items-center gap-1 rounded-lg shadow-sm ${className || 'min-w-[10rem] sm:min-w-[13rem] h-14 p-2 md:text-base'} ${
        userRole !== "OWNER" ? "w-1/5" : "w-1/4"
      }`}
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <Icon size={iconSize} />
          <h4 className="break-words">{title}</h4>
        </>
      )}
    </Button>
  );
};
