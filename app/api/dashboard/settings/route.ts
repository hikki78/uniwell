import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET endpoint to retrieve user wellness settings
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
    // Get user's wellness settings or create default if not exists
    let settings = await db.wellnessSettings.findUnique({
      where: { userId }
    });

    // If no settings found, create default settings
    if (!settings) {
      settings = await db.wellnessSettings.create({
        data: {
          userId,
          // Default values are set in the schema
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching wellness settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch wellness settings" },
      { status: 500 }
    );
  }
}

// POST endpoint to create or update wellness settings
export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    const screenTimeLimit = parseInt(body.screenTimeLimit);
    const waterIntakeGoal = parseInt(body.waterIntakeGoal);
    const meditationGoal = parseInt(body.meditationGoal);
    const sleepGoal = parseInt(body.sleepGoal);
    const exerciseGoal = parseInt(body.exerciseGoal);
    const readingGoal = parseInt(body.readingGoal);

    if (
      isNaN(screenTimeLimit) || 
      isNaN(waterIntakeGoal) || 
      isNaN(meditationGoal) || 
      isNaN(sleepGoal) || 
      isNaN(exerciseGoal) || 
      isNaN(readingGoal)
    ) {
      return NextResponse.json(
        { error: "Invalid input values" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await db.wellnessSettings.upsert({
      where: { userId },
      update: {
        screenTimeLimit,
        waterIntakeGoal,
        meditationGoal,
        sleepGoal,
        exerciseGoal,
        readingGoal,
      },
      create: {
        userId,
        screenTimeLimit,
        waterIntakeGoal,
        meditationGoal,
        sleepGoal,
        exerciseGoal,
        readingGoal,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating wellness settings:", error);
    return NextResponse.json(
      { error: "Failed to update wellness settings" },
      { status: 500 }
    );
  }
}
