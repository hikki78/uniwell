"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPermission } from "@prisma/client";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface LeaderboardMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserPermission;
  score: number;
}

interface WorkspaceLeaderboardProps {
  workspaceId: string;
}

export const WorkspaceLeaderboard = ({ workspaceId }: WorkspaceLeaderboardProps) => {
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/workspace/members/leaderboard?workspaceId=${workspaceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch workspace members');
        }
        
        const data = await response.json();
        console.log('Leaderboard data:', data);
        setMembers(data);
      } catch (error) {
        console.error('Error fetching workspace members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <Card className="w-full shadow-sm h-full hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {members.length < 2 ? (
            <p className="text-sm text-muted-foreground">Not enough members</p>
          ) : (
            members.slice(0, 5).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-5 text-muted-foreground text-sm font-medium">
                    {index + 1}.
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.image || ""} alt={member.name || member.email} />
                    <AvatarFallback>
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate max-w-[100px]">
                    {member.name || member.email.split('@')[0]}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {member.score} pts
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const LeaderboardSkeleton = () => (
  <Card className="w-full shadow-sm h-full hover:shadow-md transition-all duration-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Leaderboard
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-5 text-muted-foreground text-sm font-medium">
                {i + 1}.
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
