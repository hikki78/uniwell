# Notifications Component

A comprehensive notification system for UniWell that keeps users informed about wellness activities, reminders, and app updates.

## Features

- Display notifications with title, message, and timestamp
- Mark individual notifications as read
- Delete individual notifications
- Batch actions (mark all as read)
- Unread notification counter
- Visual distinction between read and unread notifications
- Sort notifications by recency
- Filter notifications by type or status

## Usage

```tsx
import { Notifications } from '@/components/notifications/Notifications';

// Basic usage
<Notifications 
  userId="user123"
  onNotificationRead={(id) => updateNotificationStatus(id)}
/>

// With custom notification actions
<Notifications 
  userId="user123"
  notifications={userNotifications}
  onNotificationRead={(id) => updateNotificationStatus(id)}
  onNotificationDelete={(id) => removeNotification(id)}
  onMarkAllRead={() => markAllAsRead()}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | User ID for personalized notifications | - |
| `notifications` | `Notification[]` | Notifications to display | `[]` |
| `onNotificationRead` | `(id: number) => void` | Callback when notification is read | - |
| `onNotificationDelete` | `(id: number) => void` | Callback when notification is deleted | - |
| `onMarkAllRead` | `() => void` | Callback when all notifications are marked as read | - |
| `emptyMessage` | `string` | Message to display when no notifications | "No notifications" |
| `maxDisplayCount` | `number` | Maximum number of notifications to display | `10` |

## Notification Object

```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type?: 'info' | 'reminder' | 'alert';
  icon?: string;
  actionUrl?: string;
}
```

## Integration with Backend

The component can be integrated with a notifications API through the following endpoints:

- `GET /api/notifications/:userId` - Fetch user notifications
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Testing

The component is tested with Jest and React Testing Library. Run the tests with:

```bash
npm test __tests__/components/notifications
```

Tests verify:
- Rendering notifications correctly
- Marking notifications as read
- Deleting notifications
- Handling empty notification states
- Batch actions like "mark all as read" 