import { NextResponse } from "next/server";

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

    // Directly use local responses without API calls
    // This ensures reliable responses without API issues
    const getLocalResponse = (query: string, contextInfo: string) => {
      // Include context in response generation logic
      const contextPart = contextInfo.includes("dashboard") ? "" : 
                          `For the ${contextInfo.replace("Currently on: ", "").replace(" page", "")}, `;
      
      const responses = {
        default: `I'm here to help with wellness, productivity, and study habits. ${contextPart}What would you like to know?`,
        greeting: `Hello! I'm Claude, your wellness assistant. ${contextPart}How can I help you today?`,
        wellness: `${contextPart}For better wellness, try regular exercise, adequate sleep, mindfulness practices, and staying hydrated.`,
        productivity: `${contextPart}To boost productivity, consider the Pomodoro technique, time-blocking, minimizing distractions, and taking regular breaks.`,
        study: `${contextPart}Effective study techniques include active recall, spaced repetition, teaching concepts to others, and maintaining a dedicated study environment.`
      };
      
      query = query.toLowerCase();
      if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
        return responses.greeting;
      } else if (query.includes("wellness") || query.includes("health") || query.includes("wellbeing")) {
        return responses.wellness;
      } else if (query.includes("productivity") || query.includes("focus") || query.includes("efficient")) {
        return responses.productivity;
      } else if (query.includes("study") || query.includes("learn") || query.includes("remember")) {
        return responses.study;
      }
      
      // Add context-specific responses
      if (contextInfo.includes("pomodoro")) {
        return "The Pomodoro page helps you work in focused intervals (typically 25 minutes) followed by short breaks. This technique can significantly improve your productivity and attention span.";
      } else if (contextInfo.includes("calendar")) {
        return "The Calendar page helps you organize your schedule. Good time management is essential for balancing your wellness activities with other responsibilities.";
      } else if (contextInfo.includes("settings")) {
        return "You can customize your UniWell experience through the settings page to better match your personal wellness and productivity goals.";
      } else if (contextInfo.includes("dashboard")) {
        return "The dashboard provides an overview of your wellness metrics, productivity tools, and quick access to all UniWell features. What specific aspect are you interested in?";
      }
      
      // More diverse responses to common questions
      if (query.includes("meditation") || query.includes("meditate")) {
        return "Meditation can reduce stress and improve focus. Start with just 5 minutes daily, focusing on your breath. Our meditation timer can help track your sessions.";
      } else if (query.includes("sleep") || query.includes("rest")) {
        return "Quality sleep is crucial for wellness. Aim for 7-9 hours, maintain a consistent schedule, and avoid screens before bed. Track your sleep patterns to identify improvements.";
      } else if (query.includes("stress") || query.includes("anxiety")) {
        return "For stress management, try deep breathing, regular physical activity, setting boundaries, and mindfulness practices. The pomodoro technique can also help break down overwhelming tasks.";
      } else if (query.includes("exercise") || query.includes("workout")) {
        return "Regular exercise improves both physical and mental health. Even 30 minutes of moderate activity daily can make a significant difference. What type of exercise are you interested in?";
      } else if (query.includes("time management") || query.includes("schedule")) {
        return "Effective time management starts with prioritization. Try categorizing tasks by urgency and importance, and use our calendar feature to block time for focused work.";
      }
      
      return responses.default;
    };

    // Use local response directly instead of API
    const reply = getLocalResponse(message, pageContext);
    console.log("Using local response system");
    
    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process request: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
