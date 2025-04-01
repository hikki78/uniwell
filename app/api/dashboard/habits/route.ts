import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET endpoint to retrieve user's custom habits
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
    // Get all custom habits for the user
    const habits = await db.customHabit.findMany({
      where: {
        userId,
        active: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching custom habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom habits" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new custom habit
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
    if (!body.name || !body.target || isNaN(parseInt(body.target))) {
      return NextResponse.json(
        { error: "Name and target value are required" },
        { status: 400 }
      );
    }

    // Create new habit
    const habit = await db.customHabit.create({
      data: {
        name: body.name,
        target: parseInt(body.target),
        weightInScore: body.weightInScore ? parseInt(body.weightInScore) : 10,
        userId
      }
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Error creating custom habit:", error);
    return NextResponse.json(
      { error: "Failed to create custom habit" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a custom habit
export async function PUT(request: Request) {
  const url = new URL(request.url);
  const habitId = url.searchParams.get("habitId");

  if (!habitId) {
    return NextResponse.json(
      { error: "Habit ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    // Find the habit first to verify it exists
    const existingHabit = await db.customHabit.findUnique({
      where: { id: habitId }
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: "Habit not found" },
        { status: 404 }
      );
    }

    // Update fields that are provided
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.target !== undefined) updateData.target = parseInt(body.target);
    if (body.current !== undefined) updateData.current = parseInt(body.current);
    if (body.streak !== undefined) updateData.streak = parseInt(body.streak);
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.weightInScore !== undefined) updateData.weightInScore = parseInt(body.weightInScore);

    // Update the habit
    const updatedHabit = await db.customHabit.update({
      where: { id: habitId },
      data: updateData
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error("Error updating custom habit:", error);
    return NextResponse.json(
      { error: "Failed to update custom habit" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to soft-delete a custom habit (mark as inactive)
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const habitId = url.searchParams.get("habitId");

  if (!habitId) {
    return NextResponse.json(
      { error: "Habit ID is required" },
      { status: 400 }
    );
  }

  try {
    // Soft delete by marking as inactive
    const habit = await db.customHabit.update({
      where: { id: habitId },
      data: { active: false }
    });

    return NextResponse.json({ success: true, id: habit.id });
  } catch (error) {
    console.error("Error deleting custom habit:", error);
    return NextResponse.json(
      { error: "Failed to delete custom habit" },
      { status: 500 }
    );
  }
}
