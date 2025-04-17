import { NextResponse } from "next/server";
import { getAIResponse, getLocalResponse } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    console.log("AI Chat API called");
    const body = await request.json();
    const { message, context } = body;
    
    if (!message) {
      console.log("No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Log context if provided
    const pageContext = context || "No context provided";
    console.log("Context:", pageContext);

    // Try to get a response from the AI API
    try {
      console.log("Attempting to use OpenRouter API for AI response");
      const reply = await getAIResponse(message, pageContext);
      console.log("Successfully received AI response from OpenRouter");
      return NextResponse.json({ reply });
    } catch (apiError) {
      // If the API call fails, log the error and fall back to local response
      console.error("OpenRouter API call failed, falling back to local response:", apiError);
      const fallbackReply = getLocalResponse(message, pageContext);
      console.log("Using local fallback response");
      return NextResponse.json({ 
        reply: fallbackReply,
        usedFallback: true
      });
    }
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
