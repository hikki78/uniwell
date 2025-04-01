"use client";

import { useEffect, useState, useCallback } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, RefreshCw } from "lucide-react";
import { 
  getSpotifyToken, 
  getSpotifyLoginUrl, 
  initializeSpotifyPlayer,
  fetchWithSpotifyToken
} from "@/lib/spotify";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  uri: string;
}

interface SpotifyPlayerProps {
  inMusicSection?: boolean;
}

export function SpotifyPlayer({ inMusicSection = false }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(50);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [showPlayer, setShowPlayer] = useState(inMusicSection);
  
  // Check if user is authenticated
  const checkAuthentication = useCallback(() => {
    const { token, isValid } = getSpotifyToken();
    setIsAuthenticated(!!token && isValid);
    return !!token && isValid;
  }, []);
  
  // Initialize authentication check
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  
  // Initialize Spotify SDK
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const initPlayer = async () => {
      setIsLoading(true);
      try {
        const initialized = await initializeSpotifyPlayer();
        if (initialized) {
          setIsReady(true);
        } else {
          setError("Failed to initialize Spotify player");
        }
      } catch (err) {
        console.error("Spotify initialization error:", err);
        setError("Failed to initialize Spotify player");
      } finally {
        setIsLoading(false);
      }
    };
    
    initPlayer();
  }, [isAuthenticated]);
  
  // Set up the player once SDK is ready
  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    
    const { token } = getSpotifyToken();
    if (!token) return;
    
    const setupPlayer = async () => {
      try {
        const player = new window.Spotify.Player({
          name: 'Uniwell Music Player',
          getOAuthToken: (cb: (token: string) => void) => {
            const { token: currentToken } = getSpotifyToken();
            if (currentToken) {
              cb(currentToken);
            }
          },
          volume: volume / 100
        });
        
        // Error handling
        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Initialization error:', message);
          setError(`Player initialization error: ${message}`);
        });
        
        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Authentication error:', message);
          setError(`Authentication error: ${message}. Please ensure you have a valid Spotify account and that your account is in good standing.`);
        });
        
        player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Account error:', message);
          setError(`Account error: ${message}. Please ensure you have a Spotify Premium account and that your account is in good standing.`);
        });
        //@ts-ignore
        player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Playback error:', message);
          setError(`Playback error: ${message}. Please try again or check your internet connection.`);
        });
        
        // Player status updates
        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setError(null);
        });
        
        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
          setError('Player not ready');
        });
        
        // Playback state updates
        player.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          
          setIsPlaying(!state.paused);
          
          if (state.track_window.current_track) {
            setCurrentTrack({
              id: state.track_window.current_track.id,
              name: state.track_window.current_track.name,
              artists: state.track_window.current_track.artists,
              album: state.track_window.current_track.album,
              uri: state.track_window.current_track.uri
            });
          }
        });
        
        // Connect the player
        const connected = await player.connect();
        if (connected) {
          console.log('Player connected successfully');
          setPlayer(player);
          fetchRecommendedTracks();
        }
      } catch (err) {
        console.error('Error setting up player:', err);
        setError('Failed to set up player');
      }
    };
    
    setupPlayer();
    
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [isReady, isAuthenticated, volume]);
  
  // Fetch recommended tracks
  const fetchRecommendedTracks = async () => {
    try {
      const response = await fetchWithSpotifyToken('https://api.spotify.com/v1/recommendations?seed_genres=pop,rock,indie&limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendedTracks(data.tracks);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommended tracks');
    }
  };
  
  // Control functions
  const togglePlay = async () => {
    if (!player) return;
    
    try {
      await player.togglePlay();
    } catch (err) {
      setError('Failed to toggle playback');
    }
  };
  
  const skipNext = async () => {
    if (!player) return;
    
    try {
      await player.nextTrack();
    } catch (err) {
      setError('Failed to skip to next track');
    }
  };
  
  const skipPrevious = async () => {
    if (!player) return;
    
    try {
      await player.previousTrack();
    } catch (err) {
      setError('Failed to skip to previous track');
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };
  
  const playTrack = async (uri: string) => {
    if (!deviceId) {
      setError('No device ID available');
      return;
    }
    
    try {
      const { token } = getSpotifyToken();
      if (!token) {
        setError('No valid Spotify token available');
        return;
      }
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uris: [uri] })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to play track');
      }
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'Failed to play track');
    }
  };
  
  const handleLogin = () => {
    window.location.href = getSpotifyLoginUrl();
  };
  
  const togglePlayerVisibility = () => {
    setShowPlayer(!showPlayer);
  };

  // Don't render anything if not in music section and not authenticated
  if (!inMusicSection && !isAuthenticated) {
    return null;
  }

  if (!showPlayer) {
    return (
      <button 
        onClick={togglePlayerVisibility}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
      >
        <Music className="h-5 w-5" />
      </button>
    );
  }

  return (
    <ModernCard variant="accent" className="fixed bottom-4 right-4 w-80 p-0 overflow-hidden z-50 shadow-xl">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium">Uniwell Music</h3>
        </div>
        <button 
          onClick={togglePlayerVisibility}
          className="text-white/80 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm p-2">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="p-4">
        {!isAuthenticated ? (
          <button 
            onClick={handleLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2"
          >
            <Music className="h-4 w-4" />
            Connect to Spotify
          </button>
        ) : isLoading || !deviceId ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Initializing player...</p>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-2 w-full rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTrack ? (
              <div className="flex items-center gap-3">
                {currentTrack.album?.images?.[0]?.url && (
                  <img 
                    src={currentTrack.album.images[0].url} 
                    alt="Album cover" 
                    className="w-12 h-12 rounded-md"
                  />
                )}
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{currentTrack.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentTrack.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">No track playing</p>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={skipPrevious}
                className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
                disabled={!player}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                disabled={!player}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={skipNext}
                className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
                disabled={!player}
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600"
              />
            </div>
            
            {recommendedTracks.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recommended Tracks</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {recommendedTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => playTrack(track.uri)}
                      className="w-full text-left p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md flex items-center gap-2 transition-colors"
                    >
                      {track.album.images?.[0]?.url && (
                        <img 
                          src={track.album.images[0].url} 
                          alt="" 
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate">{track.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {track.artists.map((a) => a.name).join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={fetchRecommendedTracks}
              className="w-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Recommendations
            </button>
          </div>
        )}
      </div>
    </ModernCard>
  );
}
