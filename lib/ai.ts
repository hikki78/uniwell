import axios from 'axios';

// OpenRouter API configuration
const API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default headers for OpenRouter API calls
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'HTTP-Referer': 'https://uniwell.app', // Replace with your actual domain
  'X-Title': 'UniWell Chatbot'
};

// Interface for chat completion request
interface ChatCompletionRequest {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// Interface for chat completion response
interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

/**
 * Get a response from the AI model using OpenRouter API
 * @param userMessage - The user's message
 * @param context - Optional context for the AI (e.g., current page)
 * @returns The AI's response
 */
export async function getAIResponse(userMessage: string, context?: string): Promise<string> {
  try {
    // Construct system message with context if provided
    const systemMessage = context 
      ? `You are Claude, an AI wellness assistant for the UniWell app. ${context}. Be helpful, friendly, and provide specific advice relevant to wellness, productivity, and study habits.`
      : 'You are Claude, an AI wellness assistant for the UniWell app. Be helpful, friendly, and provide specific advice relevant to wellness, productivity, and study habits.';
    
    // Prepare the request payload
    const payload: ChatCompletionRequest = {
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      model: 'anthropic/claude-3-haiku', // Use Claude Haiku for faster responses
      temperature: 0.7,
      max_tokens: 500 // Limit response length
    };

    // Make the API call to OpenRouter
    const response = await axios.post<ChatCompletionResponse>(
      API_URL,
      payload,
      { headers }
    );

    // Extract and return the assistant's response
    const aiResponse = response.data.choices[0]?.message?.content || 
                       'Sorry, I was unable to generate a response. Please try again.';
    
    return aiResponse;
  } catch (error) {
    console.error('Error calling AI API:', error);
    
    // Fallback response in case of API failure
    return 'I apologize, but I encountered an issue processing your request. The AI service might be temporarily unavailable. Please try again later.';
  }
}

/**
 * Fallback function to get a local response if API is unavailable
 * @param query - The user's query
 * @param contextInfo - Optional context information
 * @returns A locally generated response
 */
export function getLocalResponse(query: string, contextInfo: string = ''): string {
  // Normalize query for matching
  query = query.toLowerCase().trim();
  
  // Get page context
  const contextPart = contextInfo.includes("dashboard") ? "" : 
                      `For the ${contextInfo.replace("Currently on: ", "").replace(" page", "")}, `;
  
  // Function to get a random response from an array
  const getRandomResponse = (responses: string[]) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  // Create a response database with multiple variations for each category
  const responseVariations = {
    greeting: [
      `Hello! I'm your wellness assistant. ${contextPart}How can I help you today?`,
      `Hi there! Ready to support your wellness journey. ${contextPart}What can I do for you?`,
      `Welcome! I'm here to assist with your wellness needs. ${contextPart}What questions do you have?`,
      `Greetings! I'm your AI wellness companion. ${contextPart}How may I assist you?`
    ],
    default: [
      `I'm here to help with wellness, productivity, and study habits. ${contextPart}What would you like to know?`,
      `I can provide tips on well-being, focus, and learning strategies. ${contextPart}How can I assist you?`,
      `Feel free to ask about health practices, productivity methods, or study techniques. ${contextPart}What interests you?`,
      `I'm your wellness and productivity assistant. ${contextPart}What specific area would you like support with?`
    ]
  };
  
  // Check for greetings
  if (query.match(/\b(hello|hi|hey|greetings|howdy)\b/)) {
    return getRandomResponse(responseVariations.greeting);
  }
  
  // Default response if no specific pattern matches
  return getRandomResponse(responseVariations.default);
} 