# Chatbot Component

An AI-powered wellness assistant for UniWell that provides personalized guidance, answers questions, and offers support for mental and physical wellbeing.

## Features

- Natural language processing for conversational interactions
- Wellness assessment and recommendations
- Guided meditation and relaxation exercises
- Habit tracking and reminders
- Mental health resources and coping strategies
- Knowledge base for wellness questions
- Personalized responses based on user history
- Privacy-focused design

## Usage

```tsx
import { Chatbot } from '@/components/chatbot/Chatbot';

// Basic usage
<Chatbot 
  userId="user123"
  onMessageSent={(message) => trackConversation(message)}
/>

// With custom initial message
<Chatbot 
  userId="user123"
  initialMessage="How can I improve my sleep quality?"
  savedConversation={previousConversation}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | User ID for personalized responses | - |
| `initialMessage` | `string` | Initial chatbot message | Welcome message |
| `savedConversation` | `ChatMessage[]` | Previous conversation history | `[]` |
| `onMessageSent` | `(message: ChatMessage) => void` | Callback when user sends message | - |
| `onSuggestionSelect` | `(suggestion: string) => void` | Callback when suggestion is selected | - |
| `theme` | `'light' \| 'dark' \| 'auto'` | Visual theme for the chatbot | `'auto'` |
| `suggestions` | `string[]` | Quick suggestion buttons | Wellness topics |

## Chat Message Object

```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  attachments?: string[];
  metadata?: {
    category?: 'meditation' | 'nutrition' | 'exercise' | 'mental' | 'sleep';
    sentiment?: 'positive' | 'negative' | 'neutral';
    actionable?: boolean;
  };
}
```

## AI Integration

The Chatbot component integrates with:

- OpenAI API for natural language processing
- Custom wellness knowledge base
- User data for personalized assistance (with permissions)

## Testing

Run the tests for this component with:

```bash
npm test components/chatbot
``` 