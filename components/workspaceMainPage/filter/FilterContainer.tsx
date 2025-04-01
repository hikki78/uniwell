"use client";

import { Clear } from "./Clear";
import { Filter } from "./Filter";

import { ActiveFilteredUser } from "./activeFilteredUsersAndTags/ActiveFilteredUser";

import { ActiveFilteredTag } from "./activeFilteredUsersAndTags/ActiveFilteredTag";
import { useFilterByUsersAndTagsInWorkspace } from "@/context/FilterByUsersAndTagsInWorkspace";

interface Props {
  sessionUserId: string;
}

export const FilterContainer = ({ sessionUserId }: Props) => {
  const { filterAssignedUsers, filterTags } =
    useFilterByUsersAndTagsInWorkspace();

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Workspace Content</h3>
        <div className="flex items-center gap-2">
          <Filter sessionUserId={sessionUserId} />
          {(filterAssignedUsers.length > 0 || filterTags.length > 0) && <Clear />}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {filterAssignedUsers.map((user) => (
          <ActiveFilteredUser
            key={user.id}
            id={user.id}
            image={user.image}
            username={user.username}
          />
        ))}
        {filterTags.map((tag) => (
          <ActiveFilteredTag tag={tag} key={tag.id} />
        ))}
      </div>
    </div>
  );
};
