"use client";

import { useState, useEffect, useRef } from "react";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import { ModernCard } from "@/components/ui/modern-card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, MotionValue, useMotionValue, useTransform, useSpring, useAnimationControls } from "framer-motion";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId: string;
}

interface YouTubePlayerProps {
  inMusicSection?: boolean;
}

export default function YouTubePlayer({ inMusicSection = false }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [volume, setVolume] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [cdRotation, setCdRotation] = useState(0);
  const [cdAnimating, setCdAnimating] = useState(false);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const beatInterval = useRef<NodeJS.Timeout | null>(null);
  const rotationInterval = useRef<NodeJS.Timeout | null>(null);
  const rotationSpeed = useRef(1);
  const pathname = usePathname();

  // Animation controls
  const controls = useAnimationControls();
  const rotation = useMotionValue(0);
  const scale = useMotionValue(1);
  const albumRotation = useSpring(0, { stiffness: 50, damping: 10 });
  const discRotation = useMotionValue(0);
  const opacity = useMotionValue(1);
  const imageScale = useSpring(1);
  const searchHeight = useMotionValue(0);
  const playButtonScale = useSpring(1);
  const cdPosition = useMotionValue(0);
  
  // Derived motion values
  const albumShadow = useTransform(
    albumRotation,
    [-25, 0, 25],
    [
      "0px 10px 30px -5px rgba(0, 0, 0, 0.3)",
      "0px 20px 40px -10px rgba(0, 0, 0, 0.4)",
      "0px 10px 30px -5px rgba(0, 0, 0, 0.3)"
    ]
  );
  
  const playedProgress = useMotionValue(0);
  const sliderColor = useTransform(
    playedProgress,
    [0, 50, 100],
    ["#6366f1", "#8b5cf6", "#d946ef"]
  );

  // Track progress motion value
  const progressMotion = useSpring(0, { damping: 20, stiffness: 100 });
  const waveformOpacity = useMotionValue(0.6);
  
  // Dedicated CD Rotation effect
  useEffect(() => {
    // Clear any existing interval first
    if (rotationInterval.current) {
      clearInterval(rotationInterval.current);
      rotationInterval.current = null;
    }
    
    if (isPlaying) {
      // Start with a smooth acceleration
      rotationSpeed.current = 0.5;
      setCdAnimating(true);
      
      // Gradually increase rotation speed
      const accelerate = () => {
        if (rotationSpeed.current < 1) {
          rotationSpeed.current += 0.1;
        }
      };
      
      const accelerationTimer = setInterval(accelerate, 100);
      
      // Create a smooth rotation animation
      rotationInterval.current = setInterval(() => {
        setCdRotation(prev => (prev + rotationSpeed.current) % 360);
        discRotation.set(discRotation.get() + rotationSpeed.current);
      }, 16); // ~60fps for smooth animation
      
      return () => {
        clearInterval(accelerationTimer);
        if (rotationInterval.current) {
          clearInterval(rotationInterval.current);
          rotationInterval.current = null;
        }
      };
    } else if (cdAnimating) {
      // Gradual slowdown when paused
      const decelerate = () => {
        if (rotationSpeed.current > 0.1) {
          rotationSpeed.current -= 0.1;
          
          // Continue rotating but slower
          setCdRotation(prev => (prev + rotationSpeed.current) % 360);
          discRotation.set(discRotation.get() + rotationSpeed.current);
        } else {
          // Stop completely when slow enough
          if (rotationInterval.current) {
            clearInterval(rotationInterval.current);
            rotationInterval.current = null;
          }
          setCdAnimating(false);
          rotationSpeed.current = 0;
        }
      };
      
      // Create a slowdown interval
      rotationInterval.current = setInterval(decelerate, 100);
      
      return () => {
        if (rotationInterval.current) {
          clearInterval(rotationInterval.current);
          rotationInterval.current = null;
        }
      };
    }
  }, [isPlaying, discRotation]);

  // Separate beat animation from CD rotation
  useEffect(() => {
    if (isPlaying) {
      // Create a "heartbeat" effect for the beat animation
      const animateBeat = () => {
        const randomIntensity = Math.random() * 0.5 + 0.5; // Random between 0.5 and 1.0
        setBeatIntensity(randomIntensity);
        
        // Pulse the waveform opacity
        waveformOpacity.set(0.3 + randomIntensity * 0.4);
        
        // Random interval between beats to simulate music rhythm
        const nextBeatTime = Math.floor(Math.random() * 200) + 100; // 100-300ms
        beatInterval.current = setTimeout(animateBeat, nextBeatTime);
      };
      
      animateBeat();
    } else {
      // Slow down the animation when paused
      if (beatInterval.current) {
        clearTimeout(beatInterval.current);
        beatInterval.current = null;
      }
      
      waveformOpacity.set(0.3);
    }
    
    return () => {
      if (beatInterval.current) {
        clearTimeout(beatInterval.current);
        beatInterval.current = null;
      }
    };
  }, [isPlaying, waveformOpacity]);
  
  // Update progress bar
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          const current = playerRef.current.getCurrentTime() || 0;
          const total = playerRef.current.getDuration() || 0;
          
          if (total > 0) {
            setCurrentTime(current);
            setDuration(total);
            progressMotion.set((current / total) * 100);
          }
        }
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying, playerRef, progressMotion]);
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load saved player state on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedState = localStorage.getItem('youtubePlayerState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        if (parsedState.currentTrack) {
          setCurrentTrack(parsedState.currentTrack);
        }
        
        if (parsedState.queue && Array.isArray(parsedState.queue)) {
          setQueue(parsedState.queue);
        }
        
        if (typeof parsedState.volume === 'number') {
          setVolume(parsedState.volume);
        }
        
        // Don't restore isPlaying state, always start paused
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error loading player state:', error);
    }
  }, []);
  
  // Save player state when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stateToSave = {
        currentTrack,
        queue,
        volume,
        isPlaying
      };
      
      localStorage.setItem('youtubePlayerState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving player state:', error);
    }
  }, [currentTrack, queue, volume, isPlaying]);

  // Monitor route changes to handle music properly
  useEffect(() => {
    // Check if we're within a dashboard route
    const isDashboardRoute = pathname && pathname.includes('/dashboard');
    
    if (!isDashboardRoute && isPlaying && playerRef.current) {
      // Save the playing state before pausing
      setWasPlaying(true);
      // Pause if navigating away from dashboard
      playerRef.current.pauseVideo();
    } else if (isDashboardRoute && wasPlaying && playerRef.current) {
      // Resume if returning to dashboard and was playing before
      playerRef.current.playVideo();
      setWasPlaying(false);
    }
    
    // We don't want to pause when just moving between dashboard tabs
  }, [pathname, isPlaying, wasPlaying]);

  // Search YouTube for tracks
  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get API key from environment variable
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      
      if (!apiKey) {
        throw new Error("YouTube API key is missing. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your environment variables.");
      }
      
      // Make the API request
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}&type=video&videoCategoryId=10`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch from YouTube API");
      }
      
      const data = await response.json();
      
      // Process the results
      const tracks: Track[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url,
        videoId: item.id.videoId
      }));
      
      setSearchResults(tracks);
    } catch (error) {
      console.error("YouTube search error:", error);
      setError(error instanceof Error ? error.message : "Failed to search YouTube");
    } finally {
      setLoading(false);
    }
  };

  // Handle direct search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchYouTube(searchQuery);
  };

  // Add track to queue
  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    
    // If no track is currently playing, start playing this one
    if (!currentTrack) {
      setCurrentTrack(track);
    }
    
    // Clear search results once a track is added to the queue
    setSearchResults([]);
    setSearchQuery("");
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    // Bounce animation
    playButtonScale.set(1.3);
    setTimeout(() => playButtonScale.set(1), 200);
    
    if (isPlaying) {
      albumRotation.set(albumRotation.get()); // Freeze rotation
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // Skip to next track
  const skipNext = () => {
    if (queue.length === 0) return;
    
    const nextTrack = queue[0];
    setCurrentTrack(nextTrack);
    setQueue(prev => prev.slice(1));
  };

  // Skip to previous track (not implemented in this simple version)
  const skipPrevious = () => {
    // In a real implementation, you would keep track of play history
    console.log("Skip previous not implemented");
  };

  // Handle YouTube player state changes
  const handlePlayerStateChange = (event: YouTubeEvent) => {
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    switch (event.data) {
      case 1: // playing
        setIsPlaying(true);
        break;
      case 2: // paused
        setIsPlaying(false);
        break;
      case 0: // ended
        setIsPlaying(false);
        // Auto-play next track if available
        if (queue.length > 0) {
          skipNext();
        }
        break;
    }
  };

  // Handle volume change without pausing
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (playerRef.current) {
      // Just change volume without affecting playback
      playerRef.current.setVolume(newVolume);
    }
  };

  // YouTube player options
  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
    },
  };

  // Add event listener for visibilitychange to keep music playing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && playerRef.current) {
        // Keep playing when tab/window is not visible
        playerRef.current.playVideo();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
  
  // Enhanced cleanup function
  useEffect(() => {
    return () => {
      // Save the current state before unmounting
      if (typeof window !== 'undefined' && currentTrack) {
        try {
          const stateToSave = {
            currentTrack,
            queue,
            volume,
            isPlaying: isPlaying && pathname && pathname.includes('/dashboard')
          };
          
          localStorage.setItem('youtubePlayerState', JSON.stringify(stateToSave));
        } catch (error) {
          console.error('Error saving player state on unmount:', error);
        }
      }
      
      // Clean up all animation intervals
      if (rotationInterval.current) {
        clearInterval(rotationInterval.current);
        rotationInterval.current = null;
      }
      
      if (beatInterval.current) {
        clearTimeout(beatInterval.current);
        beatInterval.current = null;
      }
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      // Stop playback when component unmounts
      if (playerRef.current && isPlaying) {
        playerRef.current.pauseVideo();
      }
    };
  }, [currentTrack, queue, volume, isPlaying, pathname]);

  // Effects for animations
  useEffect(() => {
    // Update rotation continuously when track is playing
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        albumRotation.set(albumRotation.get() + 0.2);
      }, 16);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack, albumRotation]);
  
  // Animate play button on state change
  useEffect(() => {
    if (isPlaying) {
      playButtonScale.set(1.2);
      setTimeout(() => playButtonScale.set(1), 200);
    } else {
      playButtonScale.set(0.8);
      setTimeout(() => playButtonScale.set(1), 200);
    }
  }, [isPlaying, playButtonScale]);
  
  // Track change animation
  useEffect(() => {
    if (currentTrack) {
      // Reset rotation for new spin effect
      albumRotation.set(0);
      
      // Run complex animation sequence
      const sequence = async () => {
        await controls.start({
          scale: [1, 0.9, 1.1, 1],
          opacity: [1, 0.5, 1],
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.5 }
        });
        
        imageScale.set(1.1);
        setTimeout(() => imageScale.set(1), 300);
      };
      
      sequence();
    }
  }, [currentTrack, controls, albumRotation, imageScale]);

  return (
    <ModernCard className={`w-full ${inMusicSection ? 'h-full' : 'h-auto'} overflow-hidden`}>
      <motion.div 
        className="p-4 h-full flex flex-col" 
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
        {error && (
            <motion.div 
              className={`mb-4 p-3 ${error.includes('Finding') || error.includes('Looking') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'} rounded-md text-sm`}
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
            {error}
              <motion.button 
              onClick={() => setError(null)} 
              className={`ml-2 ${error.includes('Finding') || error.includes('Looking') ? 'text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100' : 'text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
              Dismiss
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Direct Search */}
        <motion.form 
          onSubmit={handleSearch} 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for music, podcasts and radio shows ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" variant="outline" disabled={loading}>
              <Search className="h-4 w-4 mr-1" />
                {loading ? 
                  <motion.span 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.span> : 
                  "Search"
                }
            </Button>
            </motion.div>
          </div>
        </motion.form>
        
        {/* Search Results */}
        <AnimatePresence>
        {searchResults.length > 0 && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
            <h3 className="text-sm font-medium mb-2">Search Results</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((track, index) => (
                  <motion.div 
                  key={track.id} 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                  onClick={() => addToQueue(track)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: 'rgba(124, 58, 237, 0.1)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="h-10 w-10 object-cover rounded"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="ghost">
                    <Play className="h-4 w-4" />
                  </Button>
                    </motion.div>
                  </motion.div>
              ))}
            </div>
            </motion.div>
        )}
        </AnimatePresence>
        
        {/* Current Track */}
        <motion.div 
          className="flex-1 flex items-center justify-center relative"
          animate={controls}
        >
          {/* Left side waveform - Enhanced with more bars */}
          {currentTrack && (
            <motion.div 
              className="absolute left-0 h-full flex flex-col justify-center items-center"
              style={{ opacity: waveformOpacity }}
            >
              <div className="flex items-end h-40 gap-[2px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={`left-wave-${i}`}
                    className="w-1 bg-gradient-to-t from-purple-400 to-violet-600 rounded-full"
                    animate={{ 
                      height: isPlaying 
                        ? [
                            5 + Math.random() * 15,
                            5 + Math.random() * 40 * beatIntensity,
                            5 + Math.random() * 25,
                            5 + Math.random() * 35 * beatIntensity,
                          ] 
                        : 3 + i * 2
                    }}
                    transition={{ 
                      duration: 0.2 + Math.random() * 0.3, 
                      ease: "easeInOut",
                      repeat: isPlaying ? Infinity : 0,
                      repeatType: "reverse",
                      delay: i * 0.03
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Right side waveform - Enhanced with more bars */}
          {currentTrack && (
            <motion.div 
              className="absolute right-0 h-full flex flex-col justify-center items-center"
              style={{ opacity: waveformOpacity }}
            >
              <div className="flex items-end h-40 gap-[2px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={`right-wave-${i}`}
                    className="w-1 bg-gradient-to-t from-fuchsia-400 to-purple-600 rounded-full"
                    animate={{ 
                      height: isPlaying 
                        ? [
                            5 + Math.random() * 20,
                            5 + Math.random() * 45 * beatIntensity,
                            5 + Math.random() * 15,
                            5 + Math.random() * 30 * beatIntensity,
                          ] 
                        : 3 + (11-i) * 2
                    }}
                    transition={{ 
                      duration: 0.2 + Math.random() * 0.3, 
                      ease: "easeInOut",
                      repeat: isPlaying ? Infinity : 0,
                      repeatType: "reverse",
                      delay: i * 0.04
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Top waveform */}
          {currentTrack && (
            <motion.div 
              className="absolute top-0 w-full flex justify-center items-start py-2"
              style={{ opacity: waveformOpacity }}
            >
              <div className="flex items-end gap-[2px] h-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`top-wave-${i}`}
                    className="h-1 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full"
                    animate={{ 
                      width: isPlaying 
                        ? [
                            2 + Math.random() * 8,
                            2 + Math.random() * 20 * beatIntensity,
                            2 + Math.random() * 6,
                          ] 
                        : 2 + Math.abs(i - 10) * 0.5
                    }}
                    transition={{ 
                      duration: 0.15 + Math.random() * 0.2, 
                      ease: "easeInOut",
                      repeat: isPlaying ? Infinity : 0,
                      repeatType: "mirror",
                      delay: i * 0.02
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {currentTrack ? (
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* CD player-like container */}
              <motion.div 
                className="w-36 h-36 mx-auto mb-6 relative rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center overflow-hidden"
                style={{ 
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* CD spindle/center */}
                <motion.div 
                  className="absolute z-10 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-gray-400"
                  style={{
                    boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.3)"
                  }}
                />
                
                {/* CD disc with grooves */}
                <motion.div 
                  className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
                  animate={{ rotate: cdRotation }}
                  transition={{ type: "tween", duration: 0.016, ease: "linear" }}
                  style={{ 
                    background: "repeating-radial-gradient(circle, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.2) 2px)"
                  }}
                >
                  {/* Album art on CD */}
                  <motion.div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-800"
                  >
                    <motion.img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title} 
                      className="w-full h-full object-cover"
                      // Use the same rotation as the CD for synchronization
                      animate={{ rotate: cdRotation }}
                      transition={{ type: "tween", duration: 0.016, ease: "linear" }}
                    />
                  </motion.div>
                </motion.div>
                
                {/* CD reflection effect */}
                <motion.div 
                  className="absolute w-36 h-36 rounded-full"
                  animate={{ rotate: cdRotation * 0.7 }}
                  transition={{ type: "tween", duration: 0.016, ease: "linear" }}
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)",
                    rotateX: 10
                  }}
                />
              </motion.div>
              
                {/* Hidden YouTube player */}
                <div className="absolute opacity-0 pointer-events-none">
                  {currentTrack && (
                    <YouTube
                      videoId={currentTrack.videoId}
                      opts={opts}
                      //@ts-ignore
                      onReady={(event) => {
                        playerRef.current = event.target;
                        event.target.setVolume(volume);
                      }}
                      onStateChange={handlePlayerStateChange}
                    />
                  )}
                </div>
              
              <motion.h3 
                className="font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentTrack.title}
              </motion.h3>
              <motion.p 
                className="text-sm text-gray-500"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentTrack.artist}
              </motion.p>
              
              {/* Track Progress */}
              <motion.div 
                className="mt-4 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                    style={{ width: progressMotion }}
                  />
              </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
            </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
              <Music className="h-12 w-12 mx-auto mb-2 opacity-20" />
              </motion.div>
              <p>No track playing</p>
              <p className="text-sm mt-1">Search for music, podcasts, or radio shows to begin</p>
            </motion.div>
          )}
        </motion.div>
        
        {/* Player Controls */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <motion.button 
              onClick={skipPrevious}
              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
              disabled={!currentTrack}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(124, 58, 237, 0.2)' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <SkipBack className="h-5 w-5" />
            </motion.button>
            
            <motion.button 
              onClick={togglePlay}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              disabled={!currentTrack}
              style={{ scale: playButtonScale }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: '#7c3aed' 
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isPlaying ? 
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <Pause className="h-5 w-5" />
                </motion.div> : 
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Play className="h-5 w-5" />
                </motion.div>
              }
            </motion.button>
            
            <motion.button 
              onClick={skipNext}
              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
              disabled={queue.length === 0}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(124, 58, 237, 0.2)' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <SkipForward className="h-5 w-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
            <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </motion.div>
            <div className="relative flex-1 py-2">
              <motion.div 
                className="absolute inset-0 flex items-center"
                style={{ opacity: 0.6 }}
              >
                <motion.div 
                  className="h-[2px] rounded-full bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 w-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isPlaying ? 1 : 0.1 }}
                  transition={{ duration: isPlaying ? 2 : 0.3, repeat: isPlaying ? Infinity : 0, repeatType: "reverse" }}
                />
              </motion.div>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
        </motion.div>
        
        {/* Queue */}
        <AnimatePresence>
        {queue.length > 0 && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
            <h3 className="text-sm font-medium mb-2">Up Next ({queue.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queue.map((track, index) => (
                  <motion.div 
                    key={`${track.id}-${index}`} 
                    className="flex items-center gap-2 p-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', x: 5 }}
                  >
                    <motion.img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="h-8 w-8 object-cover rounded"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                  </motion.div>
              ))}
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </ModernCard>
  );
}
