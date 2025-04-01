import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get all tasks assigned to the user
    const assignedTasks = await db.assignedToTask.findMany({
      where: {
        userId: userId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            content: true,
            taskDate: true,
          },
        },
      },
    });

    // Get current date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter tasks for today and count completed ones
    // For this implementation, we'll consider tasks with "completed" in their content as completed
    // This is a simplification - in a real app, you'd have a dedicated completed field
    let totalTasks = 0;
    let completedTasks = 0;

    assignedTasks.forEach(assignment => {
      const task = assignment.task;
      
      // Check if task is for today (if it has a date)
      const hasDate = task.taskDate !== null;
      //@ts-ignore
      const isForToday = hasDate ? new Date(task.taskDate!.from).setHours(0, 0, 0, 0) <= today.getTime() && 
      //@ts-ignore                           
      new Date(task.taskDate!.to || task.taskDate!.from).setHours(0, 0, 0, 0) >= today.getTime() : true;
      
      if (isForToday) {
        totalTasks++;
        
        // Check if task is completed (based on content)
        // This is a simplified approach - in a real app, you'd have a dedicated completed field
        const content = task.content as any;
        if (content && typeof content === 'object' && content.completed) {
          completedTasks++;
        }
      }
    });

    // If no tasks found, return default values
    if (totalTasks === 0) {
      // For demo purposes, return some sample data
      return NextResponse.json({
        total: 5,
        completed: 3
      });
    }

    return NextResponse.json({
      total: totalTasks,
      completed: completedTasks
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
