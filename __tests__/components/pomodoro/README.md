# Pomodoro Component

A productivity timer component for UniWell that implements the Pomodoro Technique to enhance focus, improve work quality, and maintain mental freshness.

## Features

- Configurable focus and break timers
- Visual timer display with countdown
- Session tracking and statistics
- Customizable time intervals
- Focus/break cycle automation
- Sound notifications
- Responsive design with mobile support
- Theme and color customization based on current mode

## Usage

```tsx
import { Pomodoro } from '@/components/pomodoro/Pomodoro';

// Basic usage
<Pomodoro 
  userId="user123"
  onCycleComplete={(stats) => updateProductivityStats(stats)}
/>

// With custom settings
<Pomodoro 
  userId="user123"
  initialSettings={{
    focusTime: 50,
    shortBreakTime: 10,
    longBreakTime: 30,
    longBreakInterval: 3,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    sound: true
  }}
  onCycleComplete={(stats) => updateProductivityStats(stats)}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | User ID for saving preferences | - |
| `initialSettings` | `PomodoroSettings` | Initial timer settings | Default settings |
| `onCycleComplete` | `(stats: PomodoroStats) => void` | Callback on cycle completion | - |
| `onModeChange` | `(mode: PomodoroMode) => void` | Callback when mode changes | - |
| `onSettingsChange` | `(settings: PomodoroSettings) => void` | Callback when settings change | - |
| `className` | `string` | Additional CSS class names | - |
| `theme` | `'light' \| 'dark' \| 'auto'` | Visual theme | `'auto'` |

## Type Definitions

```typescript
type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  focusTime: number;        // minutes for focus session
  shortBreakTime: number;   // minutes for short break
  longBreakTime: number;    // minutes for long break
  longBreakInterval: number; // number of pomodoros before long break
  autoStartBreaks: boolean;  // auto-start breaks after focus
  autoStartPomodoros: boolean; // auto-start focus after break
  sound: boolean;            // play sounds on completion
}

interface PomodoroStats {
  completedPomodoros: number;
  totalFocusTime: number;    // in seconds
  totalBreakTime: number;    // in seconds
  currentStreak: number;
  timestamp: Date;
}
```

## Local Storage Integration

The component saves user preferences in localStorage:

```typescript
// Save settings
localStorage.setItem(`pomodoro-settings-${userId}`, JSON.stringify(settings));

// Save stats
localStorage.setItem(`pomodoro-stats-${userId}`, JSON.stringify(stats));
```

## Testing

Test the component with:

```bash
npm test __tests__/components/pomodoro
```

Tests verify:
- Timer rendering and display
- Start/pause functionality
- Timer reset functionality
- Mode switching (focus, short break, long break)
- Cycle completion and state transitions
- Settings application
- Timer accuracy 