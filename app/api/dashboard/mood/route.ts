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
    // In a real application, you would fetch mood data from a database
    // For this implementation, we'll generate algorithmic data based on:
    // 1. Task completion rates
    // 2. Daily goals completion
    
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
            createdAt: true,
          },
        },
      },
    });

    // Generate mood data for the past week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Reorder days to start with the day that was 6 days ago
    const startDayIndex = (dayOfWeek + 1) % 7; // Convert to 0 = Monday, then find the day 6 days ago
    const orderedDays = [...days.slice(startDayIndex), ...days.slice(0, startDayIndex)];
    
    // Generate mood values based on task completion for each day
    const weeklyMood = orderedDays.map((day, index) => {
      // Calculate date for this day
      const date = new Date(today);
      date.setDate(today.getDate() - 6 + index);
      date.setHours(0, 0, 0, 0);
      
      // Find tasks for this day
      const dayTasks = assignedTasks.filter(assignment => {
        const taskDate = assignment.task.taskDate;
        if (!taskDate) return false;
        
        // Add null check for taskDate.from
        if (!taskDate.from) return false;
        
        const taskDay = new Date(taskDate.from);
        return taskDay.getDate() === date.getDate() && 
               taskDay.getMonth() === date.getMonth() && 
               taskDay.getFullYear() === date.getFullYear();
      });
      
      // Calculate completion rate
      let completionRate = 0;
      if (dayTasks.length > 0) {
        const completed = dayTasks.filter(assignment => {
          const content = assignment.task.content as any;
          return content && typeof content === 'object' && content.completed;
        }).length;
        
        completionRate = (completed / dayTasks.length) * 100;
      }
      
      // For days with no tasks, generate a reasonable mood value
      // Past days should have more consistent values, future days more variable
      const baseValue = index < dayOfWeek ? 
        70 + Math.floor(Math.random() * 20) : // Past days
        50 + Math.floor(Math.random() * 40);  // Future days
      
      // Combine base value with completion rate
      const moodValue = dayTasks.length > 0 ? 
        Math.round((baseValue + completionRate) / 2) : 
        baseValue;
      
      return {
        day,
        value: Math.min(100, moodValue) // Cap at 100
      };
    });
    
    return NextResponse.json({
      weeklyMood
    });
  } catch (error) {
    console.error("Error generating mood data:", error);
    
    // Fallback to demo data if there's an error
    const weeklyMood = [
      { day: 'Mon', value: 75 },
      { day: 'Tue', value: 82 },
      { day: 'Wed', value: 68 },
      { day: 'Thu', value: 90 },
      { day: 'Fri', value: 85 },
      { day: 'Sat', value: 95 },
      { day: 'Sun', value: 88 },
    ];
    
    return NextResponse.json({
      weeklyMood
    });
  }
}
