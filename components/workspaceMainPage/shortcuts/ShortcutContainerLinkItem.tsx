"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { UserPermission } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  Icon: LucideIcon;
  userRole: UserPermission | null;
  href: string;
  className?: string;
  iconSize?: number;
}

export const ShortcutContainerLinkItem = ({
  Icon,
  title,
  userRole,
  href,
  className,
  iconSize = 16
}: Props) => {
  return (
    <Button
      variant="outline"
      asChild
      className={className || "w-full h-14"}
    >
      <Link href={href} className="w-full h-full flex justify-between items-center px-4">
        <span className="font-medium">{title}</span>
        <Icon size={iconSize} />
      </Link>
    </Button>
  );
};
