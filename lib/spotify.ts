import { AccessToken, AuthorizationCodeWithPKCEStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = '85967ddaf14b48d395ee75b6364d0493';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';

export const spotifyConfig = {
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
};

let spotifyApi: SpotifyApi | null = null;

export const getSpotifyApi = () => {
  if (!spotifyApi) {
    const strategy = new AuthorizationCodeWithPKCEStrategy(
      CLIENT_ID,
      REDIRECT_URI,
      ['streaming', 'user-read-email', 'user-read-private', 'user-library-read', 'user-library-modify']
    );

    spotifyApi = new SpotifyApi(strategy);
  }
  return spotifyApi;
};

export const initializeSpotifyPlayer = async () => {
  return new Promise((resolve, reject) => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve(true);
      };
    } else {
      resolve(true);
    }
  });
};

declare global {
  interface Window {
    //@ts-ignore
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
