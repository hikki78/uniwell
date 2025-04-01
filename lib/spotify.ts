import { AccessToken } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export const spotifyConfig = {
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-library-modify',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'playlist-read-private',
    'playlist-read-collaborative'
  ]
};

// Local storage keys
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
const SPOTIFY_REFRESH_TOKEN_KEY = 'spotify_refresh_token';

// Token management
export const saveSpotifyToken = (token: string, expiresIn: number, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(SPOTIFY_TOKEN_KEY, token);
  localStorage.setItem(SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.toString());
  
  if (refreshToken) {
    localStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getSpotifyToken = (): { token: string | null, isValid: boolean } => {
  if (typeof window === 'undefined') return { token: null, isValid: false };
  
  const token = localStorage.getItem(SPOTIFY_TOKEN_KEY);
  const expiryTime = localStorage.getItem(SPOTIFY_TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryTime) return { token: null, isValid: false };
  
  const isValid = Date.now() < parseInt(expiryTime);
  return { token, isValid };
};

export const getSpotifyRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SPOTIFY_REFRESH_TOKEN_KEY);
};

export const clearSpotifyTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_TOKEN_EXPIRY_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_TOKEN_KEY);
};

// API helpers
export const fetchWithSpotifyToken = async (url: string, options: RequestInit = {}) => {
  const { token, isValid } = getSpotifyToken();
  
  if (!token || !isValid) {
    throw new Error('No valid Spotify token available');
  }
  
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  return fetch(url, {
    ...options,
    headers
  });
};

// Player initialization
export const initializeSpotifyPlayer = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  return new Promise((resolve) => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          resolve(true);
        };
      };
      
      script.onerror = () => {
        console.error('Failed to load Spotify Web Playback SDK');
        resolve(false);
      };
      
      document.body.appendChild(script);
    } else {
      resolve(true);
    }
  });
};

// Get login URL
export const getSpotifyLoginUrl = () => {
  const state = Math.random().toString(36).substring(2, 15);

  const params: Record<string, string> = {};

  if (CLIENT_ID) {
    params.client_id = CLIENT_ID;
  }
  params.response_type = 'code';
  if (REDIRECT_URI) {
    params.redirect_uri = REDIRECT_URI;
  }
  params.state = state;
  params.scope = spotifyConfig.scopes.join(' ');

  const urlParams = new URLSearchParams(params);

  return `https://accounts.spotify.com/authorize?${urlParams.toString()}`;
};

// Import types from the type definition file
// The types are already defined in /types/spotify.d.ts

// Add onSpotifyWebPlaybackSDKReady to the Window interface
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
