"use client";

import { useEffect, useState, useCallback } from "react";
// DashboardHeader is now included in the layout
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Battery, Brain, Heart, Coffee, Sun, Music2, Quote, Monitor, Volume2, Moon, CloudRain, Timer, Droplet, Target, PlayCircle, PauseCircle, Zap, Sparkles, Cloud, CloudSun, CloudMoon, Stars, SkipBack, SkipForward, Calendar, Settings } from "lucide-react";
import { getScreenTime, updateScreenTime } from "@/lib/screen-time";
import { useSession } from "next-auth/react";
import axios from "axios";
import dynamic from "next/dynamic";
import { MeditationTimer } from "@/components/dashboard/MeditationTimer";
import { WaterReminder } from "@/components/dashboard/WaterReminder";
import { ScreenTimeMonitor } from "@/components/dashboard/ScreenTimeMonitor";
import { toast } from "sonner";

// Import YouTubePlayer component with dynamic import to prevent SSR issues
const YouTubePlayer = dynamic(() => import("@/components/music/YouTubePlayer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-60">
      <div className="animate-pulse text-purple-500">Loading music player...</div>
    </div>
  )
});

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

// Add these new types and constants
interface MoodQuestion {
  id: number;
  question: string;
  options?: {
    label: string;
    value: number;
  }[];
  type: 'choice' | 'rating';
  max?: number;
}

interface MoodResponse {
  date: string;
  score: number;
  responses: {
    questionId: number;
    value: number;
  }[];
}

const moodQuestions: MoodQuestion[] = [
  {
    id: 1,
    question: "How are you feeling today?",
    options: [
      { label: "Great", value: 10 },
      { label: "Good", value: 8 },
      { label: "Fine", value: 6 },
      { label: "Ok", value: 4 },
      { label: "Not bad", value: 2 },
      { label: "Bad", value: 0 }
    ],
    type: 'choice'
  },
  {
    id: 2,
    question: "How well did you sleep last night?",
    type: 'rating',
    max: 10
  },
  {
    id: 3,
    question: "How socially connected do you feel today?",
    type: 'rating',
    max: 10
  },
  {
    id: 4,
    question: "How much will you rate your productivity today?",
    type: 'rating',
    max: 10
  },
  {
    id: 5,
    question: "Rate your wellbeing today",
    type: 'rating',
    max: 10
  }
];

const getMoodSalutation = (score: number): string => {
  const percentage = (score / 50) * 100;
  if (percentage >= 90) return "Excellent mood!";
  if (percentage >= 80) return "Great mood!";
  if (percentage >= 70) return "Good mood!";
  if (percentage >= 60) return "Positive mood!";
  if (percentage >= 50) return "Decent mood!";
  if (percentage >= 40) return "Fair mood";
  if (percentage >= 30) return "Could be better";
  if (percentage >= 20) return "Not so great";
  return "Having a rough day";
};

// Add this function for pie chart rendering
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="hsl(var(--foreground))" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name}: ${value}%`}
    </text>
  );
};

export default function WellbeingDashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isClient, setIsClient] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  // Music player state now managed by YouTubePlayer component
  const [screenTime, setScreenTime] = useState("0h 0m");
  const [weather, setWeather] = useState({ temp: '20°C', condition: 'Clear', icon: '' });
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [meditationTime, setMeditationTime] = useState(300);
  const [isMediating, setIsMediating] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
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
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [moodResponses, setMoodResponses] = useState<{[key: number]: number}>({});
  const [dailyMoodScore, setDailyMoodScore] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodResponse[]>([]);
  const [hasTrackedToday, setHasTrackedToday] = useState(false);
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isAiAssistantLoading, setIsAiAssistantLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  // Add state for tracking main activities goals and custom activities
  const [activitiesState, setActivitiesState] = useState({
    screenTime: { label: "Screen Time", value: "0", target: "0", unit: "hours" },
    meditation: { label: "Meditation", value: "0", target: "0", unit: "minutes" },
    water: { label: "Water Intake", value: "0", target: "0", unit: "ml" }
  });
  const [customActivities, setCustomActivities] = useState<{
    id: string;
    label: string;
    value: string;
    target: string;
    unit: string;
    isCompleted: boolean;
  }[]>([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    label: "", 
    target: "", 
    unit: "minutes" 
  });
  
  // Replace API functions with local implementation
  const getMoodInsight = useCallback((score: number): string => {
    const percentage = (score / 50) * 100;
    
    // Array of encouraging messages based on score ranges
    if (percentage >= 90) {
      return "Your excellent mood today will help you accomplish anything you set your mind to!";
    } else if (percentage >= 80) {
      return "Great spirits lead to great achievements - keep up this positive energy!";
    } else if (percentage >= 70) {
      return "Your good mood is a solid foundation for a productive and fulfilling day.";
    } else if (percentage >= 60) {
      return "This positive attitude will help you navigate today's challenges with grace.";
    } else if (percentage >= 50) {
      return "A decent mood is something to build upon - try a quick walk to boost it further!";
    } else if (percentage >= 40) {
      return "Even in fair moods, you have the strength to accomplish meaningful things today.";
    } else if (percentage >= 30) {
      return "Remember that moods fluctuate - a few minutes of deep breathing can help improve yours.";
    } else if (percentage >= 20) {
      return "Be gentle with yourself today and focus on small self-care activities.";
    } else {
      return "Tough days are part of being human - reach out to a friend if you need support.";
    }
  }, []);
  
  // Update useEffect to use local implementation instead of API
  useEffect(() => {
    if (dailyMoodScore !== null) {
      setIsAiAssistantLoading(true);
      
      // Simulate loading with setTimeout
      setTimeout(() => {
        setAiInsight(getMoodInsight(dailyMoodScore));
        setIsAiAssistantLoading(false);
      }, 1000);
    }
  }, [dailyMoodScore, getMoodInsight]);

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
        // Use fallback data when API fails
        setWeather({
          temp: '22°C',
          condition: 'Clear',
          icon: ''
        });
        toast.error("Couldn't load weather data. Using defaults.", {
          id: "weather-error",
          duration: 3000
        });
      }
    };
    
    fetchWeather();
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);
  

  
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
        // Use default settings if API fails
        setSettings(defaultSettings);
        
        // Update daily goals with default settings
        setDailyGoals(prev => [
          { ...prev[0], text: `${defaultSettings.exerciseGoal} minutes exercise` },
          { ...prev[1], text: `${defaultSettings.sleepGoal} hours sleep` },
          { ...prev[2], text: `${defaultSettings.waterIntakeGoal / 1000}L water intake` },
          { ...prev[3], text: `${defaultSettings.meditationGoal} minutes meditation` },
        ]);
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
  
  // Updated useEffect that loads mood data from localStorage
  useEffect(() => {
    if (!userId) return;
    
    const checkTodaysMood = () => {
      try {
        // Check if mood has been tracked today using localStorage
        if (typeof window !== 'undefined') {
          const storedMoodData = localStorage.getItem(`moodData-${userId}`);
          
          if (storedMoodData) {
            const moodData = JSON.parse(storedMoodData);
            const today = new Date().toDateString();
            
            // Check if today's data exists
            if (moodData.date === today) {
              setHasTrackedToday(true);
              setDailyMoodScore(moodData.score);
            } else {
              // Show mood tracker once on page load if not tracked today
              setTimeout(() => {
                setShowMoodTracker(true);
              }, 1000);
            }
            
            // Set up pie chart data
            if (moodData.score) {
              const percentScore = (moodData.score / 50) * 100;
              const remaining = 100 - percentScore;
              setPieChartData([
                { name: 'Mood Score', value: percentScore, color: '#8b5cf6' },
                { name: 'Remaining', value: remaining, color: '#e4e4e7' }
              ]);
            }
          } else {
            // No stored data - show tracker
            setTimeout(() => {
              setShowMoodTracker(true);
            }, 1000);
          }
          
          // Load mood history from localStorage
          const historyData = localStorage.getItem(`moodHistory-${userId}`);
          if (historyData) {
            const history = JSON.parse(historyData);
            setMoodHistory(history);
            
            // Update chart data from history
            const chartData = initialData.weeklyMood.map(day => {
              const found = history.find((h: MoodResponse) => {
                const date = new Date(h.date);
                return day.day === format(date, 'EEE');
              });
              
              return {
                day: day.day,
                value: found ? (found.score / 50) * 100 : 0
              };
            });
            
            setMoodData(chartData);
          }
        }
      } catch (error) {
        console.error('Error loading mood data:', error);
      }
    };
    
    checkTodaysMood();
  }, [userId]);
  
  // Updated function to save mood data using localStorage
  const saveMoodData = () => {
    if (!userId || Object.keys(moodResponses).length !== moodQuestions.length) return;
    
    try {
      // Calculate total score
      const totalScore = Object.values(moodResponses).reduce((sum, value) => sum + value, 0);
      
      // Format responses for storage
      const responses = Object.entries(moodResponses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value
      }));
      
      const currentDate = new Date();
      const today = currentDate.toDateString();
      
      // Create mood data object
      const moodData = {
        userId,
        score: totalScore,
        responses,
        date: today,
        timestamp: currentDate.toISOString()
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        // Save today's mood
        localStorage.setItem(`moodData-${userId}`, JSON.stringify(moodData));
        
        // Update history
        const historyData = localStorage.getItem(`moodHistory-${userId}`);
        let history = historyData ? JSON.parse(historyData) : [];
        
        // Add today's entry to history or update if exists
        const todayIndex = history.findIndex((h: MoodResponse) => 
          new Date(h.date).toDateString() === today
        );
        
        if (todayIndex >= 0) {
          history[todayIndex] = moodData;
        } else {
          history.push(moodData);
        }
        
        // Limit history to last 30 days
        if (history.length > 30) {
          history = history.slice(history.length - 30);
        }
        
        // Save updated history
        localStorage.setItem(`moodHistory-${userId}`, JSON.stringify(history));
      }
      
      // Update state
      setDailyMoodScore(totalScore);
      setHasTrackedToday(true);
      
      // Add to history state
      const newHistory = [...moodHistory.filter(h => 
        new Date(h.date).toDateString() !== today
      ), {
        date: currentDate.toISOString(),
        score: totalScore,
        responses
      }];
      
      setMoodHistory(newHistory);
      
      // Update chart data
      setMoodData(prevData => {
        const today = format(new Date(), 'EEE');
        return prevData.map(item => {
          if (item.day === today) {
            return { ...item, value: (totalScore / 50) * 100 };
          }
          return item;
        });
      });
      
      // Update pie chart data
      const percentScore = (totalScore / 50) * 100;
      const remaining = 100 - percentScore;
      setPieChartData([
        { name: 'Mood Score', value: percentScore, color: '#8b5cf6' },
        { name: 'Remaining', value: remaining, color: '#e4e4e7' }
      ]);
      
      // Close tracker and show results
      setShowMoodTracker(false);
      setCurrentQuestionIndex(0);
      setMoodResponses({});
      setShowResultsModal(true);
      
      toast.success("Mood tracked successfully!");
        } catch (error) {
      console.error('Error saving mood data:', error);
      toast.error("Failed to save mood data. Please try again.");
    }
  };
  
  // Handle answering a question
  const answerQuestion = (value: number) => {
    // Save response
    setMoodResponses(prev => ({
      ...prev,
      [moodQuestions[currentQuestionIndex].id]: value
    }));
    
    // Move to next question or finish
    if (currentQuestionIndex < moodQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      saveMoodData();
    }
  };
  
  // Calculate wellness score based on the new algorithm
  useEffect(() => {
    const calculateWellnessScore = () => {
      // 1. Mood score component (30%)
      let moodComponent = 0;
      if (dailyMoodScore !== null) {
        moodComponent = (dailyMoodScore / 50) * 100 * 0.3; // 30% weight
      }
      
      // 2. Screen time component (20%)
      // Lower is better for screen time (percentage of limit not exceeded)
      let screenTimeComponent = 0;
      const screenTimeValue = parseFloat(activitiesState.screenTime.value) || 0;
      const screenTimeTarget = parseFloat(activitiesState.screenTime.target) || 1;
      // If screen time is below target, it's good (100%)
      // If it's above target, calculate the inverse percentage, but not below 0
      const screenTimePercentage = screenTimeTarget > 0 
        ? Math.max(0, Math.min(100, 100 - ((screenTimeValue - screenTimeTarget) / screenTimeTarget * 100)))
        : 0;
      screenTimeComponent = screenTimePercentage * 0.2; // 20% weight
      
      // 3. Meditation component (20%)
      let meditationComponent = 0;
      const meditationValue = parseFloat(activitiesState.meditation.value) || 0;
      const meditationTarget = parseFloat(activitiesState.meditation.target) || 1;
      const meditationPercentage = meditationTarget > 0 
        ? Math.min(100, (meditationValue / meditationTarget) * 100)
        : 0;
      meditationComponent = meditationPercentage * 0.2; // 20% weight
      
      // 4. Water intake component (20%)
      let waterComponent = 0;
      const waterValue = parseInt(activitiesState.water.value) || 0;
      const waterTarget = parseInt(activitiesState.water.target) || 1;
      const waterPercentage = waterTarget > 0
        ? Math.min(100, (waterValue / waterTarget) * 100)
        : 0;
      waterComponent = waterPercentage * 0.2; // 20% weight
      
      // 5. Custom activities component (10%)
      let activitiesComponent = 0;
      if (customActivities.length > 0) {
        const completedActivities = customActivities.filter(a => a.isCompleted).length;
        const activitiesPercentage = (completedActivities / customActivities.length) * 100;
        activitiesComponent = activitiesPercentage * 0.1; // 10% weight
      } else {
        // If no custom activities, distribute the 10% to the other components evenly
        if (dailyMoodScore !== null) moodComponent += 2.5; // additional 2.5%
        screenTimeComponent += 2.5; // additional 2.5%
        meditationComponent += 2.5; // additional 2.5%
        waterComponent += 2.5; // additional 2.5%
      }
      
      // Calculate total wellness score
      const calculatedScore = Math.max(
        10, // Minimum wellness score
        Math.round(moodComponent + screenTimeComponent + meditationComponent + waterComponent + activitiesComponent)
      );
      
      setWellnessScore(calculatedScore);
    };
    
    // Calculate score when any component changes
    calculateWellnessScore();
    
    // Set up interval to recalculate score periodically
    const interval = setInterval(calculateWellnessScore, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [
    dailyMoodScore, 
    activitiesState.screenTime.value,
    activitiesState.screenTime.target,
    activitiesState.meditation.value, 
    activitiesState.meditation.target,
    activitiesState.water.value,
    activitiesState.water.target,
    customActivities
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMediating && meditationTime > 0) {
      timer = setInterval(() => {
        setMeditationTime((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMediating, meditationTime]);

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

  // Effect to sync the main activities data
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Load custom activities from localStorage
      const storedActivities = localStorage.getItem(`customActivities-${userId}`);
      if (storedActivities) {
        setCustomActivities(JSON.parse(storedActivities));
      }
      
      // Update the main activities when their targets change
      const screenTimeTarget = localStorage.getItem(`screenTimeLimit-${userId}`);
      const screenTimeData = localStorage.getItem(`screenTimeData-${userId}`);
      const meditationDuration = localStorage.getItem(`meditationDuration-${userId}`);
      const waterGoalData = localStorage.getItem(`waterGoal-${userId}`);
      const waterReminderData = localStorage.getItem(`waterReminder-${userId}`);
      
      let screenTimeUsed = "0";
      let screenTimeLimit = "0";
      let meditationTarget = "0";
      let waterAmount = "0";
      let waterGoal = "0";
      
      if (screenTimeTarget) {
        screenTimeLimit = (parseInt(screenTimeTarget) / 60).toFixed(1); // Convert minutes to hours
      }
      
      if (screenTimeData) {
        const data = JSON.parse(screenTimeData);
        if (data.timeUsed) {
          screenTimeUsed = (data.timeUsed / 60).toFixed(1); // Convert minutes to hours
        }
      }
      
      if (meditationDuration) {
        meditationTarget = meditationDuration;
      }
      
      if (waterGoalData) {
        waterGoal = waterGoalData;
      }
      
      if (waterReminderData) {
        const data = JSON.parse(waterReminderData);
        if (data.waterAmount !== undefined) {
          waterAmount = data.waterAmount.toString();
        }
      }
      
      setActivitiesState({
        screenTime: { 
          label: "Screen Time", 
          value: screenTimeUsed, 
          target: screenTimeLimit, 
          unit: "hours" 
        },
        meditation: { 
          label: "Meditation", 
          value: "0", // This will update when used
          target: meditationTarget, 
          unit: "minutes" 
        },
        water: { 
          label: "Water Intake", 
          value: waterAmount, 
          target: waterGoal, 
          unit: "ml" 
        }
      });
    } catch (error) {
      console.error("Error loading activities data:", error);
    }
  }, [userId, isClient, settingsUpdated]);
  
  // Function to add a new custom activity
  const addCustomActivity = () => {
    if (!newActivity.label || !newActivity.target) {
      toast.error("Please provide both activity name and target");
      return;
    }
    
    const id = `activity-${Date.now()}`;
    const activity = {
      id,
      label: newActivity.label,
      value: "0",
      target: newActivity.target,
      unit: newActivity.unit,
      isCompleted: false
    };
    
    const updatedActivities = [...customActivities, activity];
    setCustomActivities(updatedActivities);
    
    // Save to localStorage
    localStorage.setItem(`customActivities-${userId}`, JSON.stringify(updatedActivities));
    
    // Reset form
    setNewActivity({ label: "", target: "", unit: "minutes" });
    setShowAddActivity(false);
    
    toast.success(`Added ${activity.label} activity`);
  };
  
  // Function to update a custom activity
  const updateCustomActivity = (id: string, isCompleted: boolean) => {
    const updatedActivities = customActivities.map(activity => {
      if (activity.id === id) {
        return { 
          ...activity, 
          isCompleted, 
          value: isCompleted ? activity.target : "0" 
        };
      }
      return activity;
    });
    
    setCustomActivities(updatedActivities);
    
    // Save to localStorage
    localStorage.setItem(`customActivities-${userId}`, JSON.stringify(updatedActivities));
  };
  
  // Function to delete a custom activity
  const deleteCustomActivity = (id: string) => {
    const updatedActivities = customActivities.filter(activity => activity.id !== id);
    setCustomActivities(updatedActivities);
    
    // Save to localStorage
    localStorage.setItem(`customActivities-${userId}`, JSON.stringify(updatedActivities));
    
    toast.success("Activity removed");
  };

  // Add useEffect to set isClient flag when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

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

            {/* Mood Score Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <h3 className="text-xl font-semibold">Mood Score</h3>
                  </div>
                {hasTrackedToday ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Already tracked today</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoodTracker(true)}
                    className="flex items-center gap-1"
                  >
                    Track Today's Mood
                  </Button>
                )}
                </div>

              {dailyMoodScore !== null && (
                <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Today's Mood:</span>
                  <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{Math.round((dailyMoodScore / 50) * 100)}%</span>
                      <span className="text-md text-muted-foreground">
                        {getMoodSalutation(dailyMoodScore)}
                      </span>
                  </div>
                  </div>
                  <Progress 
                    value={(dailyMoodScore / 50) * 100} 
                    className="h-2 mt-2"
                  />
                  
                  {/* AI Insight Section */}
                  {(aiInsight || isAiAssistantLoading) && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">AI Insight:</span>
                          <p className="text-sm mt-1">
                            {isAiAssistantLoading ? (
                              <span className="text-muted-foreground animate-pulse">Analyzing your mood data...</span>
                            ) : (
                              aiInsight
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="h-[300px] w-full flex items-center justify-center">
                {dailyMoodScore !== null ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Mood Score', value: Math.round((dailyMoodScore / 50) * 100), color: '#8b5cf6' },
                          { name: 'Remaining', value: 100 - Math.round((dailyMoodScore / 50) * 100), color: '#e4e4e7' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ value, name, index }) => index === 0 ? `${value}%` : null}
                        outerRadius={100}
                        innerRadius={70}
                        fill="#8b5cf6"
                        dataKey="value"
                      >
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#e4e4e7" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Track your mood to see your score</p>
                </div>
                )}
              </div>
              </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userId && (
                <MeditationTimer 
                  userId={userId} 
                  onComplete={() => setIsMediating(false)}
                />
              )}

              {userId && (
                <WaterReminder
                  userId={userId}
                  onSettingsChange={() => setSettingsUpdated(prev => prev + 1)}
                />
              )}

              {userId && (
                <ScreenTimeMonitor
                  userId={userId}
                  onSettingsChange={() => setSettingsUpdated(prev => prev + 1)}
                  initialLimit={settings.screenTimeLimit}
                />
              )}
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audio Corner */}
              <div className="flex flex-col">
                <Card className="p-6 flex-grow bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                      <Music2 className="h-6 w-6 text-indigo-500" />
                      <h3 className="text-xl font-semibold">Audio Corner</h3>
                </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                </div>

                  <div className="rounded-lg overflow-hidden border shadow-sm">
                    {/* Integrated YouTube Player */}
                    {/* For YouTube API, name your environment variable: NEXT_PUBLIC_YOUTUBE_API_KEY */}
                    <YouTubePlayer inMusicSection={true} />
            </div>

                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    Powered by YouTube - Relax with your favorite music and podcasts
                  </div>
                </Card>
              </div>

              {/* Activities Corner */}
              <div className="flex flex-col">
                <Card className="p-6 flex-grow bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-6 w-6 text-emerald-500" />
                      <h3 className="text-xl font-semibold">Activity Corner</h3>
                    </div>
                    {userId && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddActivity(!showAddActivity)}
                          className="h-8 rounded-full text-emerald-600 dark:text-emerald-400"
                        >
                          {showAddActivity ? 'Cancel' : 'Add Activity'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Activity Form */}
                  {showAddActivity && (
                    <div className="mb-4 p-4 rounded-lg border bg-white/80 dark:bg-black/20">
                      <h4 className="text-sm font-medium mb-2">Add New Activity</h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Activity Name</label>
                            <input 
                              type="text"
                              placeholder="the stuff you actually want to do 😜"
                              value={newActivity.label}
                              onChange={(e) => setNewActivity({...newActivity, label: e.target.value})}
                              className="w-full h-8 px-2 text-sm rounded-md border"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground mb-1 block">Target</label>
                              <input 
                                type="text"
                                placeholder="1"
                                value={newActivity.target}
                                onChange={(e) => setNewActivity({...newActivity, target: e.target.value})}
                                className="w-full h-8 px-2 text-sm rounded-md border"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
                              <select
                                value={newActivity.unit}
                                onChange={(e) => setNewActivity({...newActivity, unit: e.target.value})}
                                className="h-8 px-2 text-sm rounded-md border"
                              >
                                <option value="minutes">minutes</option>
                                <option value="hours">hours</option>
                                <option value="km">km</option>
                                <option value="steps">steps</option>
                                <option value="times">times</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={addCustomActivity}
                          className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          Add Activity
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 rounded-lg border p-4 bg-white/50 dark:bg-black/10">
                    {/* Main Activities */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Main Activities</h4>
                      
                      {/* Screen Time */}
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-emerald-600" />
                          <div>
                            <span className="text-sm font-medium">Screen Time</span>
                            <div className="text-xs text-muted-foreground">
                              {activitiesState.screenTime.value} / {activitiesState.screenTime.target} {activitiesState.screenTime.unit}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.min(100, (parseFloat(activitiesState.screenTime.value) / parseFloat(activitiesState.screenTime.target) * 100) || 0).toFixed(0)}%
                        </div>
                  </div>
                  
                      {/* Meditation */}
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Heart className="h-5 w-5 text-emerald-600" />
                          <div>
                            <span className="text-sm font-medium">Meditation</span>
                            <div className="text-xs text-muted-foreground">
                              {activitiesState.meditation.value} / {activitiesState.meditation.target} {activitiesState.meditation.unit}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.min(100, (parseFloat(activitiesState.meditation.value) / parseFloat(activitiesState.meditation.target) * 100) || 0).toFixed(0)}%
                        </div>
                      </div>
                      
                      {/* Water Intake */}
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Droplet className="h-5 w-5 text-emerald-600" />
                          <div>
                            <span className="text-sm font-medium">Water Intake</span>
                            <div className="text-xs text-muted-foreground">
                              {parseInt(activitiesState.water.value) >= 1000 
                                ? `${(parseInt(activitiesState.water.value)/1000).toFixed(1)}L / ${(parseInt(activitiesState.water.target)/1000).toFixed(1)}L` 
                                : `${activitiesState.water.value} / ${activitiesState.water.target} ${activitiesState.water.unit}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.min(100, (parseInt(activitiesState.water.value) / parseInt(activitiesState.water.target) * 100) || 0).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Activities */}
                    {customActivities.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium mb-2">Extra Curricular</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => toast.info("Tap activities to mark as complete. Long press to delete.")}
                          >
                            ?
                          </Button>
                      </div>
                        
                        {customActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 mb-2"
                            onClick={() => updateCustomActivity(activity.id, !activity.isCompleted)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              deleteCustomActivity(activity.id);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className={`h-5 w-5 rounded-full border-2 cursor-pointer ${activity.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500'}`}
                              />
                              <div>
                                <span className={`text-sm font-medium ${activity.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {activity.label}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  Target: {activity.target} {activity.unit}
                                </div>
                              </div>
                            </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomActivity(activity.id);
                              }}
                            >
                              ×
                              </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Track Your Mood</h3>
            
            <div className="mb-6">
              <h4 className="text-lg mb-4">
                {moodQuestions[currentQuestionIndex].question}
              </h4>
              
              {moodQuestions[currentQuestionIndex].type === 'choice' ? (
                <div className="grid grid-cols-2 gap-3">
                  {moodQuestions[currentQuestionIndex].options?.map((option) => (
                    <Button
                      key={option.label}
                      variant="outline"
                      className="h-12"
                      onClick={() => answerQuestion(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                    </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={moodQuestions[currentQuestionIndex].max || 10}
                      step="1"
                      defaultValue="5"
                      value={ratingValue}
                      className="w-full h-2 rounded-full"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setRatingValue(value);
                      }}
                    />
                    <span className="w-10 text-center">{ratingValue}</span>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => answerQuestion(ratingValue)}
                  >
                    {currentQuestionIndex === moodQuestions.length - 1 ? "Show Result" : "Next"}
                  </Button>
                </div>
              )}
                  </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {moodQuestions.length}</span>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowMoodTracker(false);
                  setCurrentQuestionIndex(0);
                  setMoodResponses({});
                }}
              >
                Cancel
              </button>
          </div>
        </div>
        </div>
      )}
      
      {/* Result Modal */}
      {showResultsModal && dailyMoodScore !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Your Mood Score</h3>
            
            <div className="text-center mb-6">
              <div className="mb-4">
                <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  {Math.round((dailyMoodScore / 50) * 100)}%
                </span>
              </div>
              
              <div className="text-xl font-medium">
                {getMoodSalutation(dailyMoodScore)}
              </div>
              
              <div className="mt-6 text-muted-foreground text-sm">
                <p>Based on your responses to the 5 questions:</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div className="bg-secondary/30 p-2 rounded-md">
                    90-100%: "Excellent mood!"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    80-89%: "Great mood!"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    70-79%: "Good mood!"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    60-69%: "Positive mood!"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    50-59%: "Decent mood!"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    40-49%: "Fair mood"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    30-39%: "Could be better"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    20-29%: "Not so great"
                  </div>
                  <div className="bg-secondary/30 p-2 rounded-md">
                    0-19%: "Having a rough day"
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setShowResultsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}