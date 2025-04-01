// Type definitions for Spotify Web Playback SDK
interface SpotifyPlayer {
  device_id: string;
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
  addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
  addListener(
    event: 'player_state_changed',
    callback: (state: SpotifyPlaybackState | null) => void
  ): void;
  addListener(event: 'initialization_error', callback: (error: { message: string }) => void): void;
  addListener(event: 'authentication_error', callback: (error: { message: string }) => void): void;
  addListener(event: 'account_error', callback: (error: { message: string }) => void): void;
  removeListener(event: string, callback?: Function): void;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  setName(name: string): Promise<void>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}

interface SpotifyPlaybackState {
  context: {
    uri: string;
    metadata: Record<string, any>;
  };
  disallows: {
    pausing: boolean;
    skipping_prev: boolean;
    skipping_next: boolean;
    resuming: boolean;
    seeking: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyTrack {
  id: string | null;
  uri: string;
  type: 'track' | 'episode' | 'ad';
  media_type: 'audio' | 'video';
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{
    uri: string;
    name: string;
  }>;
  duration_ms: number;
}

interface SpotifyPlayerConstructorOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
  enableMediaSession?: boolean;
}

interface Window {
  Spotify: {
    Player: {
      new (options: SpotifyPlayerConstructorOptions): SpotifyPlayer;
    };
  };
}
