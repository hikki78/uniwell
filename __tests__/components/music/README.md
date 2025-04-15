# Music Component

A therapeutic music player for UniWell that provides wellness-focused audio content designed to enhance meditation, focus, relaxation, and sleep.

## Features

- Curated wellness music and sound libraries
- Categorized playlists (meditation, focus, relaxation, sleep)
- Customizable ambient sound mixer
- Timer functionality for sleep and meditation sessions
- Background playback support
- User favorites and history
- Audio visualization
- Volume and equalizer controls

## Usage

```tsx
import { MusicPlayer } from '@/components/music/MusicPlayer';

// Basic usage
<MusicPlayer 
  userId="user123"
  onTrackChange={(track) => logTrackPlay(track)}
/>

// With specific category
<MusicPlayer 
  userId="user123"
  category="meditation"
  autoplay={true}
  showVisualizer={true}
/>
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `userId` | `string` | User ID for personalized experience | - |
| `category` | `'meditation' \| 'focus' \| 'relaxation' \| 'sleep' \| 'all'` | Initial category to display | `'all'` |
| `autoplay` | `boolean` | Auto-start playback | `false` |
| `initialVolume` | `number` | Initial volume level (0-100) | `80` |
| `showVisualizer` | `boolean` | Show audio visualization | `false` |
| `showTimer` | `boolean` | Show sleep/meditation timer | `true` |
| `onTrackChange` | `(track: Track) => void` | Callback when track changes | - |
| `onSessionComplete` | `(session: Session) => void` | Callback when timer session completes | - |

## Track Object

```typescript
interface Track {
  id: string;
  title: string;
  artist?: string;
  duration: number; // in seconds
  url: string;
  coverUrl?: string;
  category: 'meditation' | 'focus' | 'relaxation' | 'sleep';
  tags?: string[];
  isPreferred?: boolean;
}

interface Session {
  duration: number; // in seconds
  trackId: string;
  category: string;
  completed: boolean;
  timestamp: Date;
}
```

## Audio Content

The music component comes with:

- 50+ royalty-free wellness tracks
- 20+ ambient sound samples
- 10 curated playlists
- Binaural beats and frequency optimized tracks

## Testing

Run the tests for this component with:

```bash
npm test components/music
``` 