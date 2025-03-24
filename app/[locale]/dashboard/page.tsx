"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import Welcoming from "@/components/common/Welcoming";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Brain, Heart, Coffee, Sun, Music2, Quote, Monitor, Volume2, Moon, CloudRain, Timer, Droplets, Target, PlayCircle, PauseCircle, Zap, Sparkles, Cloud, CloudSun, CloudMoon, Stars, SkipBack, SkipForward } from "lucide-react";
import { getScreenTime, updateScreenTime } from "@/lib/screen-time";

const mockData = {
  weeklyMood: [
    { day: 'Mon', value: 75 },
    { day: 'Tue', value: 82 },
    { day: 'Wed', value: 68 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 88 },
  ],
  metrics: {
    energyLevel: 85,
    stressLevel: 45,
    mindfulness: 70,
    workLifeBalance: 80,
  },
  habits: [
    { name: 'Meditation', streak: 5, target: 10, current: 7 },
    { name: 'Exercise', streak: 3, target: 30, current: 15 },
    { name: 'Reading', streak: 8, target: 20, current: 18 },
    { name: 'Sleep', streak: 4, target: 8, current: 7 },
  ],
};

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
];

export default function WellbeingDashboard() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [screenTime, setScreenTime] = useState("0h 0m");
  const [weather, setWeather] = useState({ temp: '20°C', condition: 'Clear' });
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [meditationTime, setMeditationTime] = useState(300);
  const [isMediating, setIsMediating] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [currentTab, setCurrentTab] = useState('mood');
  // Comment out Spotify related state variables
  // const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
  // const [currentTrack, setCurrentTrack] = useState<any>(null);
  // const [deviceId, setDeviceId] = useState<string>('');
  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: "30 minutes exercise", completed: false },
    { id: 2, text: "8 hours sleep", completed: true },
    { id: 3, text: "2L water intake", completed: false },
    { id: 4, text: "10 minutes meditation", completed: false },
  ]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const time = updateScreenTime();
      setScreenTime(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMediating && meditationTime > 0) {
      timer = setInterval(() => {
        setMeditationTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMediating, meditationTime]);

  // Comment out the Spotify initialization useEffect
  /*
  useEffect(() => {
    const loadSpotify = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { getSpotifyApi, initializeSpotifyPlayer } = await import('@/lib/spotify');
          const api = getSpotifyApi();
          await api.authenticate();

          await initializeSpotifyPlayer();
          const player = new window.Spotify.Player({
            name: 'Wellbeing Dashboard',
            getOAuthToken: (cb: (token: string) => void) => {
              //@ts-ignore
              api.getAccessToken().then((token) => cb(token.access_token));
            },
          });

          player.addListener('ready', ({ device_id }: { device_id: string }) => {
            setDeviceId(device_id);
          });

          player.addListener('player_state_changed', (state: any) => {
            if (state) {
              setCurrentTrack(state.track_window.current_track);
              setIsPlaying(!state.paused);
            }
          });

          await player.connect();
          setSpotifyPlayer(player);
        } catch (error) {
          console.error('Spotify initialization error:', error);
        }
      }
    };

    loadSpotify();

    return () => {
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
  }, []);
  */

  // Comment out Spotify control functions
  const handlePrevious = () => {
    // if (spotifyPlayer) {
    //   spotifyPlayer.previousTrack();
    // }
  };

  const handleNext = () => {
    // if (spotifyPlayer) {
    //   spotifyPlayer.nextTrack();
    // }
  };

  const togglePlayback = async () => {
    // if (!spotifyPlayer) return;
    
    // try {
    //   if (isPlaying) {
    //     await spotifyPlayer.pause();
    //   } else {
    //     await spotifyPlayer.resume();
    //   }
      setIsPlaying(!isPlaying);
    // } catch (error) {
    //   console.error('Playback error:', error);
    // }
  };

  const getGreetingStyle = () => {
    const styles = {
      morning: {
        gradient: 'from-amber-100 via-yellow-100 to-orange-100',
        darkGradient: 'dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30',
        icon: <Sun className="h-16 w-16 text-amber-500 animate-pulse" />,
        message: "Rise & Shine Beautiful! ✨",
        secondary: "Let's make today amazing"
      },
      afternoon: {
        gradient: 'from-sky-100 via-blue-100 to-indigo-100',
        darkGradient: 'dark:from-sky-950/30 dark:via-blue-950/30 dark:to-indigo-950/30',
        icon: <CloudSun className="h-16 w-16 text-sky-500" />,
        message: "Afternoon Vibes! 🌤️",
        secondary: "Keep the momentum going"
      },
      evening: {
        gradient: 'from-purple-100 via-pink-100 to-rose-100',
        darkGradient: 'dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30',
        icon: <CloudMoon className="h-16 w-16 text-purple-500" />,
        message: "Evening Serenity 🌅",
        secondary: "Time to unwind and reflect"
      },
      night: {
        gradient: 'from-slate-100 via-gray-100 to-zinc-100',
        darkGradient: 'dark:from-slate-950/30 dark:via-gray-950/30 dark:to-zinc-950/30',
        icon: <Stars className="h-16 w-16 text-slate-500 animate-twinkle" />,
        message: "Peaceful Night 🌙",
        secondary: "Sweet dreams ahead"
      }
    };
    return styles[timeOfDay];
  };

  const style = getGreetingStyle();

  return (
    <>
      <DashboardHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <Welcoming
            hideOnDesktop
            className="mb-6"
            username="User"
            name="Wellness"
            surname="Explorer"
          />
          
          <div className="space-y-8">
            <Card className={`p-8 bg-gradient-to-r ${style.gradient} ${style.darkGradient} border-none shadow-xl overflow-hidden relative`}>
              <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]" />
              <div className="relative flex items-start gap-6">
                <div className="bg-white/30 dark:bg-white/10 rounded-full p-4 backdrop-blur-sm">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                    {style.message}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {style.secondary}
                  </p>
                  <div className="flex gap-4 mt-6">
                    <div className="bg-white/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Wellness Score: 85</span>
                    </div>
                    <div className="bg-white/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                      <Cloud className="h-5 w-5 text-sky-500" />
                      <span className="font-medium">{weather.temp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <Quote className="h-8 w-8 text-primary mb-4" />
              <p className="text-xl font-serif italic">{currentQuote.text}</p>
              <p className="mt-2 text-right text-muted-foreground">— {currentQuote.author}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">Meditation Timer</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediating(!isMediating)}
                  >
                    {isMediating ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-3xl font-bold text-center py-4">
                  {Math.floor(meditationTime / 60)}:{(meditationTime % 60).toString().padStart(2, '0')}
                </div>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Water Intake</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWaterIntake(Math.min(waterIntake + 250, 2000))}
                  >
                    +250ml
                  </Button>
                </div>
                <Progress value={(waterIntake / 2000) * 100} className="h-2" />
                <span className="text-sm text-muted-foreground">{waterIntake}ml / 2000ml</span>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-medium">Screen Time Today</h3>
                </div>
                <div className="text-2xl font-bold">{screenTime}</div>
                <span className="text-sm text-muted-foreground">Daily Limit: 8h</span>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Productivity Score</h3>
                </div>
                <Progress value={75} className="h-2" />
                <span className="text-sm text-muted-foreground">75% Productive Today</span>
              </Card>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
                <TabsTrigger value="habits">Habits</TabsTrigger>
                <TabsTrigger value="music">Focus Music</TabsTrigger>
              </TabsList>

              <TabsContent value="mood" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Weekly Mood Overview</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockData.weeklyMood}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="habits" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Daily Goals</h3>
                  </div>
                  <div className="space-y-4">
                    {dailyGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer"
                        onClick={() => setDailyGoals(dailyGoals.map(g => 
                          g.id === goal.id ? { ...g, completed: !g.completed } : g
                        ))}
                      >
                        <div className={`h-5 w-5 rounded-full border-2 ${goal.completed ? 'bg-primary border-primary' : 'border-primary'}`} />
                        <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                          {goal.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="music" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Music2 className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">Music Player</h3>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-6 space-y-6">
                    <div className="text-center mb-8">
                      <p className="text-muted-foreground">Spotify integration temporarily disabled</p>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handlePrevious}
                        className="hover:bg-primary/10"
                        disabled={true}
                      >
                        <SkipBack className="h-6 w-6" />
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full w-16 h-16 flex items-center justify-center"
                        onClick={togglePlayback}
                        disabled={true}
                      >
                        {isPlaying ? (
                          <PauseCircle className="h-8 w-8" />
                        ) : (
                          <PlayCircle className="h-8 w-8" />
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleNext}
                        className="hover:bg-primary/10"
                        disabled={true}
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mt-8">
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                      <Slider
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          // Spotify volume control commented out
                          // if (spotifyPlayer) {
                          //   spotifyPlayer.setVolume(value[0] / 100);
                          // }
                        }}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}