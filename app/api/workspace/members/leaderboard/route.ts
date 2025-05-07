import { db } from "@/lib/db";
import { UserPermission } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { dynamicConfig } from "../../../config";

interface LeaderboardMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserPermission;
  score: number;
}

interface WorkspaceMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserPermission;
}

interface TaskCount {
  creatorId: string;
  _count: {
    id: number;
  };
}

interface MindMapCount {
  creatorId: string;
  _count: {
    id: number;
  };
}

interface MessageCount {
  senderId: string;
  _count: {
    id: number;
  };
}

// Export the dynamic config
export const { runtime, dynamic } = dynamicConfig;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    console.log('Fetching workspace members for workspace:', workspaceId);
    
    // Check the Prisma models available
    console.log('Available Prisma models:', Object.keys(db));
    
    // Get all members of the workspace with their roles using the Subscription model
    const subscriptions = await db.subscription.findMany({
      where: {
        workspaceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    console.log('Found subscriptions:', subscriptions);
    
    // Map subscriptions to workspace members
    const workspaceMembers = subscriptions.map(sub => ({
      id: sub.user.id,
      name: sub.user.name,
      email: sub.user.email,
      image: sub.user.image,
      role: sub.userRole
    }));

    console.log('Found workspace members:', workspaceMembers);
    
    // Get activity counts for each user (tasks, mind maps, messages)
    const memberIds = workspaceMembers.map((member) => member.id);

    // Get task counts
    const taskCounts = await db.task.groupBy({
      by: ["creatorId"],
      where: {
        workspaceId,
        creatorId: {
          in: memberIds,
        },
      },
      _count: {
        id: true,
      },
    }) as unknown as TaskCount[];

    // Get mind map counts
    const mindMapCounts = await db.mindMap.groupBy({
      by: ["creatorId"],
      where: {
        workspaceId,
        creatorId: {
          in: memberIds,
        },
      },
      _count: {
        id: true,
      },
    }) as unknown as MindMapCount[];

    // Get message counts
    const messageCounts = await db.message.groupBy({
      by: ["senderId"],
      where: {
        sender: {
          id: {
            in: memberIds,
          },
        },
        conversation: {
          workspaceId,
        },
      },
      _count: {
        id: true,
      },
    }) as unknown as MessageCount[];

    console.log('Task counts:', taskCounts);
    console.log('Mind map counts:', mindMapCounts);
    console.log('Message counts:', messageCounts);
    
    // Calculate scores for each member
    const leaderboardData: LeaderboardMember[] = workspaceMembers.map((member) => {
      const taskCount = taskCounts.find((t) => t.creatorId === member.id)?._count?.id || 0;
      const mindMapCount = mindMapCounts.find((m) => m.creatorId === member.id)?._count?.id || 0;
      const messageCount = messageCounts.find((m) => m.senderId === member.id)?._count?.id || 0;
      
      // Calculate score: tasks = 5 points, mind maps = 3 points, messages = 1 point
      const score = taskCount * 5 + mindMapCount * 3 + messageCount;

      return {
        id: member.id,
        name: member.name,
        email: member.email || '',
        image: member.image,
        role: member.role,
        score,
      };
    });

    // Sort by score (highest first)
    leaderboardData.sort((a: LeaderboardMember, b: LeaderboardMember) => b.score - a.score);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error("[WORKSPACE_MEMBERS_LEADERBOARD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
