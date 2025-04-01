# AI Chatbot Setup Instructions

The UniWell workspace now includes an AI chatbot powered by OpenAI GPT-3.5. Follow these steps to set up the API key:

## Getting an OpenAI API Key

1. Visit [OpenAI](https://platform.openai.com/) and create an account
2. Navigate to the API Keys section in your dashboard
3. Create a new API key
4. Copy the API key for the next step

## Adding the API Key to Your Environment

Add the following line to your `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key you obtained from OpenAI.

## Restart Your Development Server

After adding the API key, restart your development server for the changes to take effect:

```bash
npm run dev
```

## Using the Chatbot

The AI chatbot appears as a small chat icon in the bottom right corner of all workspace pages. Click on it to open the chat interface and start asking questions about productivity, wellness, and study habits.

## Customization

You can customize the chatbot's behavior by modifying:

- The system prompt in `/app/api/ai/chat/route.ts` to change the AI's personality and knowledge focus
- The UI appearance in `/components/chatbot/AIChatbot.tsx`
- The model used by changing the `model` parameter in the API call (e.g., from "gpt-3.5-turbo" to "gpt-4" for more advanced capabilities)
