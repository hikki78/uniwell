# InviteUsers Component

A component for UniWell that allows users to invite friends, family, or colleagues to join the wellness platform through email invitations.

## Features

- Email invitation system for multiple recipients
- Email validation with error handling
- Batch invitation sending
- Real-time invitation status updates
- Results tracking and display
- Clean and responsive user interface
- Accessibility compliant

## Usage

```tsx
import { InviteUsers } from '@/components/inviteUsers/InviteUsers';

// Basic usage
<InviteUsers 
  userId="user123"
  onInviteSent={(results) => trackInvitations(results)}
/>

// With custom settings
<InviteUsers 
  userId="user123"
  maxInvites={10}
  inviteMessage="Join me on UniWell for a better wellness journey!"
  onInviteSent={(results) => trackInvitations(results)}
  onError={(error) => handleError(error)}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | ID of the user sending invitations | - |
| `maxInvites` | `number` | Maximum number of emails allowed per batch | `20` |
| `inviteMessage` | `string` | Custom invitation message | Standard message |
| `onInviteSent` | `(results: InviteResult[]) => void` | Callback when invitations are sent | - |
| `onError` | `(error: Error) => void` | Callback when an error occurs | - |
| `className` | `string` | Additional CSS class names | - |
| `allowPersonalMessage` | `boolean` | Allow user to add a personal message | `false` |

## Invitation Result Object

```typescript
interface InviteResult {
  email: string;
  success: boolean;
  message: string;
  timestamp: Date;
}
```

## Integration with Backend

The component integrates with the invitation API:

- `POST /api/invitations/send` - Send invitation emails

Request body example:
```json
{
  "userId": "user123",
  "emails": ["friend@example.com", "colleague@example.com"],
  "message": "Join me on UniWell!"
}
```

Response example:
```json
{
  "results": [
    {
      "email": "friend@example.com",
      "success": true,
      "message": "Invitation sent successfully"
    },
    {
      "email": "colleague@example.com",
      "success": true,
      "message": "Invitation sent successfully"
    }
  ]
}
```

## Testing

Test the component with:

```bash
npm test __tests__/components/inviteUsers
```

Tests verify:
- Component rendering correctly
- Email validation (single and multiple emails)
- Error handling for invalid emails
- Success handling for valid invitations
- UI state changes during invitation process 