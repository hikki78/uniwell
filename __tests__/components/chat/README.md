# Chat Component

A real-time chat component for UniWell that enables users to communicate with support staff, wellness coaches, or other users.

## Features

- Real-time messaging
- Message history
- User typing indicators
- Read receipts
- File and image sharing
- Emoji support
- Fully responsive interface
- Conversation grouping

## Usage

```tsx
import { Chat } from '@/components/chat/Chat';

// Basic usage for 1:1 chat
<Chat 
  userId="user123"
  recipientId="coach456"
  onSendMessage={(message) => handleMessageSend(message)}
/>

// For group chats
<Chat 
  userId="user123"
  groupId="wellness-group-789"
  onSendMessage={(message) => handleMessageSend(message)}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | Current user's ID | - |
| `recipientId` | `string` | 1:1 chat recipient ID | - |
| `groupId` | `string` | Group chat ID | - |
| `initialMessages` | `Message[]` | Initial messages to display | `[]` |
| `onSendMessage` | `(message: Message) => void` | Callback when message is sent | - |
| `onFileUpload` | `(file: File) => Promise<string>` | Function to handle file uploads | - |
| `showTyping` | `boolean` | Show typing indicators | `true` |
| `showReadReceipts` | `boolean` | Show read receipts | `true` |

## Message Object

```typescript
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  read?: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name?: string;
    size?: number;
  }>;
}
```

## Backend Integration

For real-time functionality, the Chat component integrates with:

- WebSockets for live updates
- RESTful API for message history
- File storage service for attachments

## Testing

Run the tests for this component with:

```bash
npm test components/chat
``` 