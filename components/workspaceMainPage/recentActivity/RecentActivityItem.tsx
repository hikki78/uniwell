"use client";

import { ReadOnlyEmoji } from "@/components/common/ReadOnlyEmoji";
import { StarSvg } from "@/components/common/StarSvg";
import { UserHoverInfo } from "@/components/common/UserHoverInfoCard";
import { Card, CardContent } from "@/components/ui/card";
import { useTruncateText } from "@/hooks/useTruncateText";
import { WorkspaceRecentActivity } from "@/types/extended";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next/link";
import { TagItem } from "./TagItem";
import { AssignedToTaskUser } from "./AssignedToTaskUser";

interface Props {
  activity: WorkspaceRecentActivity;
}

export const RecentActivityItem = ({
  activity: { tags, title, emoji, starred, type, updated, assignedTo, link },
}: Props) => {
  const router = useRouter();

  const truncatedTitle = useTruncateText(title, 40);

  const c = useTranslations("COMMON");
  const format = useFormatter();
  const dateTime = new Date(updated.at);
  const now = new Date();

  const itemTypeSentence =
    type === "mindMap"
      ? c("EDITED_ITEM_SENTENCE.MIND_MAP")
      : c("EDITED_ITEM_SENTENCE.TASK");
  return (
    <Link href={link}>
      <Card className="shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex gap-3 w-full">
            <ReadOnlyEmoji
              className="h-10 w-10 flex-shrink-0"
              selectedEmoji={emoji}
            />
            <div className="w-full overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium truncate">
                  {!title && type === "mindMap" && c("DEFAULT_NAME.MIND_MAP")}
                  {!title && type === "task" && c("DEFAULT_NAME.TASK")}
                  {title && truncatedTitle}
                </h3>
                {starred && <StarSvg className="ml-2 w-4 h-4 flex-shrink-0" />}
              </div>
              {updated.by && (
                <div className="flex items-center flex-wrap text-sm text-muted-foreground mt-1">
                  <span>{itemTypeSentence}</span>
                  <span className="mx-1">{format.relativeTime(dateTime, now)}</span>
                  <span>{c("EDITED_ITEM_SENTENCE.BY")}</span>
                  <UserHoverInfo className="px-0 ml-1" user={updated.by} />
                </div>
              )}
              <div className="flex items-center flex-wrap gap-1 mt-2">
                {assignedTo.map((user) => (
                  <AssignedToTaskUser key={user.id} userInfo={user} />
                ))}
                {tags.map((tag) => (
                  <TagItem key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
