import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("AI Chat API called");
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      console.log("No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("API Key available:", !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Prepare request payload
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for the UniWell platform. Keep your answers concise and friendly. Focus on providing helpful information about productivity, wellness, and study habits."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500
    };
    
    console.log("Sending request to OpenAI with payload:", JSON.stringify(payload));

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log("OpenAI response status:", response.status);
    
    // Parse response data
    const data = await response.json();
    console.log("OpenAI response data:", JSON.stringify(data));
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to get response from AI" },
        { status: response.status }
      );
    }

    // Check if we have the expected response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response structure:", data);
      return NextResponse.json(
        { error: "Received unexpected response format from AI service" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: data.choices[0].message.content
    });
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
