"use client";

import { useEffect, useState } from "react";
// DashboardHeader is now included in the layout
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpotifyPlayer } from "@/components/spotify/SpotifyPlayer";
import { WellnessSettings } from "@/components/dashboard/WellnessSettings";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Brain, Heart, Coffee, Sun, Music2, Quote, Monitor, Volume2, Moon, CloudRain, Timer, Droplets, Target, PlayCircle, PauseCircle, Zap, Sparkles, Cloud, CloudSun, CloudMoon, Stars, SkipBack, SkipForward, Calendar, Settings } from "lucide-react";
import { getScreenTime, updateScreenTime } from "@/lib/screen-time";
import { useSession } from "next-auth/react";
import axios from "axios";

// Initial data structure that will be replaced with real data
const initialData = {
  weeklyMood: [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ],
  metrics: {
    energyLevel: 0,
    stressLevel: 0,
    mindfulness: 0,
    workLifeBalance: 0,
  },
  habits: [
    { name: 'Meditation', streak: 0, target: 10, current: 0 },
    { name: 'Exercise', streak: 0, target: 30, current: 0 },
    { name: 'Reading', streak: 0, target: 20, current: 0 },
    { name: 'Sleep', streak: 0, target: 8, current: 0 },
  ],
};

// Default wellness settings
const defaultSettings = {
  screenTimeLimit: 480, // 8 hours in minutes
  waterIntakeGoal: 2000, // 2000ml
  meditationGoal: 10, // 10 minutes
  sleepGoal: 8, // 8 hours
  exerciseGoal: 30, // 30 minutes
  readingGoal: 20, // 20 minutes
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
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  // Music player state (needed for UI even though actual control is in SpotifyPlayer)
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [screenTime, setScreenTime] = useState("0h 0m");
  const [weather, setWeather] = useState({ temp: '20°C', condition: 'Clear', icon: '' });
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [meditationTime, setMeditationTime] = useState(300);
  const [isMediating, setIsMediating] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [currentTab, setCurrentTab] = useState('habits');
  const [productivityScore, setProductivityScore] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [moodData, setMoodData] = useState(initialData.weeklyMood);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);
  const [customHabits, setCustomHabits] = useState<any[]>([]);
  
  // Task and habit data
  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: "30 minutes exercise", completed: false },
    { id: 2, text: "8 hours sleep", completed: true },
    { id: 3, text: "2L water intake", completed: false },
    { id: 4, text: "10 minutes meditation", completed: false },
  ]);
  
  // Refresh trigger for settings changes
  const [settingsUpdated, setSettingsUpdated] = useState(0);
  const [tasks, setTasks] = useState<{ total: number, completed: number }>({ total: 0, completed: 0 });

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
  
  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('/api/weather/get');
        if (response.data) {
          setWeather({
            temp: `${response.data.current.temp_c}°C`,
            condition: response.data.current.condition.text,
            icon: response.data.current.condition.icon
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };
    
    fetchWeather();
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);
  
  // Fetch tasks data for productivity score
  useEffect(() => {
    if (!userId) return;
    
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Fetch all tasks for the user
        const response = await axios.get(`/api/dashboard/tasks?userId=${userId}`);
        if (response.data) {
          setTasks({
            total: response.data.total,
            completed: response.data.completed
          });
          
          // Calculate productivity score based on task completion
          const score = response.data.total > 0 
            ? Math.round((response.data.completed / response.data.total) * 100) 
            : 0;
          setProductivityScore(score);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [userId]);
  
  // Fetch user settings
  useEffect(() => {
    if (!userId) return;
    
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/dashboard/settings?userId=${userId}`);
        if (response.data) {
          setSettings(response.data);
          
          // Update daily goals text to match settings
          setDailyGoals(prev => [
            { ...prev[0], text: `${response.data.exerciseGoal} minutes exercise` },
            { ...prev[1], text: `${response.data.sleepGoal} hours sleep` },
            { ...prev[2], text: `${response.data.waterIntakeGoal / 1000}L water intake` },
            { ...prev[3], text: `${response.data.meditationGoal} minutes meditation` },
          ]);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
  }, [userId, settingsUpdated]);
  
  // Fetch custom habits
  useEffect(() => {
    if (!userId) return;
    
    const fetchCustomHabits = async () => {
      try {
        const response = await axios.get(`/api/dashboard/habits?userId=${userId}`);
        if (response.data) {
          setCustomHabits(response.data);
        }
      } catch (error) {
        console.error('Error fetching custom habits:', error);
      }
    };
    
    fetchCustomHabits();
  }, [userId, settingsUpdated]);
  
  // Fetch mood data
  useEffect(() => {
    if (!userId) return;
    
    const fetchMoodData = async () => {
      try {
        const response = await axios.get(`/api/dashboard/mood?userId=${userId}`);
        if (response.data && response.data.weeklyMood) {
          setMoodData(response.data.weeklyMood);
        }
      } catch (error) {
        console.error('Error fetching mood data:', error);
      }
    };
    
    fetchMoodData();
  }, [userId]);
  
  // Calculate wellness score based on multiple factors
  useEffect(() => {
    // Calculate wellness score based on:
    // 1. Productivity score (30%)
    // 2. Meditation completion (15%)
    // 3. Water intake goal (15%)
    // 4. Screen time within limits (15%)
    // 5. Mood tracking (15%)
    // 6. Music/relaxation (10%)
    // 7. Custom habits (distributed from other categories)
    
    // Calculate base scores
    const meditationScore = isMediating || dailyGoals.find(g => g.id === 4)?.completed ? 15 : 0;
    const waterScore = (waterIntake / settings.waterIntakeGoal) * 15;
    
    // Calculate screen time score (lower is better)
    const screenTimeHours = parseInt(screenTime.split('h')[0]) || 0;
    const screenTimeMinutes = parseInt(screenTime.split('h')[1]?.split('m')[0]) || 0;
    const totalScreenTimeMinutes = (screenTimeHours * 60) + screenTimeMinutes;
    const screenTimeScore = totalScreenTimeMinutes <= settings.screenTimeLimit ? 15 : 
      Math.max(0, 15 - (((totalScreenTimeMinutes - settings.screenTimeLimit) / 60) * 3));
    
    // Calculate mood score from the average of the week
    const moodAverage = moodData.reduce((sum, day) => sum + day.value, 0) / moodData.length;
    const moodScore = (moodAverage / 100) * 15;
    
    // Music/relaxation score
    const musicScore = isPlaying ? 10 : 0;
    
    // Calculate custom habits score
    let customHabitsScore = 0;
    let totalCustomWeight = 0;
    
    if (customHabits.length > 0) {
      // Sum up total weight of all custom habits
      totalCustomWeight = customHabits.reduce((sum, habit) => sum + habit.weightInScore, 0);
      
      // Cap total weight at 30% to avoid overwhelming the score
      const cappedTotalWeight = Math.min(30, totalCustomWeight);
      
      // Calculate score for each habit
      customHabits.forEach(habit => {
        if (habit.active) {
          const habitCompletion = habit.current / habit.target;
          const weightRatio = habit.weightInScore / totalCustomWeight;
          customHabitsScore += (habitCompletion * weightRatio * cappedTotalWeight);
        }
      });
    }
    
    // Adjust other scores if custom habits exist
    const adjustmentFactor = totalCustomWeight > 0 ? Math.max(0.7, 1 - (totalCustomWeight / 100)) : 1;
    
    // Calculate total wellness score
    const totalScore = Math.round(
      (productivityScore * 0.3 * adjustmentFactor) + 
      (meditationScore * adjustmentFactor) + 
      (waterScore * adjustmentFactor) + 
      (screenTimeScore * adjustmentFactor) + 
      (moodScore * adjustmentFactor) + 
      (musicScore * adjustmentFactor) +
      customHabitsScore
    );
    
    setWellnessScore(Math.min(100, totalScore));
  }, [productivityScore, isMediating, waterIntake, screenTime, moodData, isPlaying, dailyGoals, settings, customHabits]);

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
  // Music control functions (placeholders for UI, actual control is in SpotifyPlayer)
  const handlePrevious = () => {
    // Placeholder for previous track functionality
  };

  const handleNext = () => {
    // Placeholder for next track functionality
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
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
      <main className="min-h-screen bg-background">
        <div className="container mx-auto p-6">

          
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
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Wellness Score: {wellnessScore}</span>
                    </div>
                    <div className="bg-white/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                      <Cloud className="h-5 w-5 text-sky-500" />
                      <span className="font-medium">{weather.condition} {weather.temp}</span>
                      {weather.icon && (
                        <img src={`https:${weather.icon}`} alt={weather.condition} className="h-5 w-5" />
                      )}
                    </div>
                    <div className="bg-white/30 dark:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{format(new Date(), 'MMMM d, yyyy')}</span>
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
                <Progress value={(waterIntake / settings.waterIntakeGoal) * 100} className="h-2" />
                <span className="text-sm text-muted-foreground">{waterIntake}ml / {settings.waterIntakeGoal}ml</span>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-medium">Screen Time Today</h3>
                </div>
                <div className="text-2xl font-bold">{screenTime}</div>
                <span className="text-sm text-muted-foreground">Daily Limit: {Math.floor(settings.screenTimeLimit / 60)}h {settings.screenTimeLimit % 60}m</span>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Productivity</h3>
                </div>
                <Progress value={productivityScore} className="h-2" />
                <span className="text-sm text-muted-foreground">{productivityScore}% Productive Today</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {tasks.completed} of {tasks.total} tasks completed
                </div>
              </Card>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="habits">Daily Goals</TabsTrigger>
                <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
                <TabsTrigger value="music">Spotify Music</TabsTrigger>
              </TabsList>

              <TabsContent value="mood" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Weekly Mood Overview</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodData}>
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">Goals & Habits</h3>
                    </div>
                    {userId && (
                      <WellnessSettings 
                        userId={userId} 
                        onSettingsChange={() => setSettingsUpdated(prev => prev + 1)} 
                      />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Default goals */}
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
                    
                    {/* Custom habits */}
                    {customHabits.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-lg font-medium mb-4">Custom Habits</h4>
                        {customHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 mb-3"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className={`h-5 w-5 rounded-full border-2 cursor-pointer ${habit.current >= habit.target ? 'bg-primary border-primary' : 'border-primary'}`}
                                onClick={() => {
                                  // Toggle completion status
                                  const newValue = habit.current >= habit.target ? 0 : habit.target;
                                  axios.put(`/api/dashboard/habits?habitId=${habit.id}`, {
                                    current: newValue,
                                    streak: newValue > 0 ? habit.streak + 1 : habit.streak
                                  }).then(() => setSettingsUpdated(prev => prev + 1));
                                }}
                              />
                              <div>
                                <span className={habit.current >= habit.target ? 'line-through text-muted-foreground' : ''}>
                                  {habit.name}
                                </span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Progress: {habit.current}/{habit.target} | Streak: {habit.streak} days
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  // Increment progress
                                  axios.put(`/api/dashboard/habits?habitId=${habit.id}`, {
                                    current: Math.min(habit.current + 1, habit.target)
                                  }).then(() => setSettingsUpdated(prev => prev + 1));
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="music" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Music2 className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">Spotify Music</h3>
                    </div>
                  </div>

                  {/* Integrated Spotify Player */}
                  <SpotifyPlayer inMusicSection={true} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}