// Type definitions for YouTube integration

// Track object structure
export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId: string;
}

// YouTube Player props
export interface YouTubePlayerProps {
  inMusicSection?: boolean;
}

// YouTube API event object
export interface YouTubeEvent {
  data: number;
  target: any;
}

// YouTube API player interface from the external library
export interface YouTubePlayer {
  // Player state
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  
  // Player information
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoLoadedFraction: () => number;
  getPlayerState: () => number;
  getVolume: () => number;
  
  // Player settings
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setSize: (width: number, height: number) => void;
  
  // Video loading
  loadVideoById: (videoId: string, startSeconds?: number, suggestedQuality?: string) => void;
  cueVideoById: (videoId: string, startSeconds?: number, suggestedQuality?: string) => void;
  
  // Event listeners
  addEventListener: (event: string, listener: Function) => void;
  removeEventListener: (event: string, listener: Function) => void;
  
  // Player management
  destroy: () => void;
} 