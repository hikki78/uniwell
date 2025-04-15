# Calendar Component

An interactive calendar component for UniWell that helps users track wellness activities, appointments, and goals.

## Features

- Interactive date selection
- Event creation and management
- Daily, weekly, and monthly views
- Activity tracking integration
- Color-coded event categories
- Recurring event support
- Responsive design for all devices

## Usage

```tsx
import { Calendar } from '@/components/calendar/Calendar';

// Basic usage
<Calendar 
  userId="user123"
  onDateSelect={(date) => handleDateSelect(date)}
/>

// With events
<Calendar 
  userId="user123"
  events={userEvents}
  onEventClick={(event) => handleEventClick(event)}
  onEventCreate={(event) => handleEventCreate(event)}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | User ID for personalized calendar | - |
| `initialDate` | `Date` | Initial date to display | `new Date()` |
| `view` | `'day' \| 'week' \| 'month'` | Calendar view to display | `'month'` |
| `events` | `CalendarEvent[]` | Events to display on calendar | `[]` |
| `onDateSelect` | `(date: Date) => void` | Callback when date is selected | - |
| `onEventClick` | `(event: CalendarEvent) => void` | Callback when event is clicked | - |
| `onEventCreate` | `(event: CalendarEvent) => void` | Callback when event is created | - |
| `onViewChange` | `(view: 'day' \| 'week' \| 'month') => void` | Callback when view changes | - |

## Event Object

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: 'meditation' | 'exercise' | 'water' | 'sleep' | 'custom';
  color?: string;
  description?: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'none';
}
```

## Testing

Run the tests for this component with:

```bash
npm test components/calendar
``` 