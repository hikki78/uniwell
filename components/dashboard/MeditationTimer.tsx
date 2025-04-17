"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Heart, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface MeditationTimerProps {
  userId: string;
  onComplete?: () => void;
}

export function MeditationTimer({ userId, onComplete }: MeditationTimerProps) {
  const [isClient, setIsClient] = useState(false);
  // Timer state
  const [duration, setDuration] = useState(10); // Default 10 minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60); // In seconds
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Reference for the timer interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDuration = localStorage.getItem(`meditationDuration-${userId}`);
        if (savedDuration) {
          const parsedDuration = parseInt(savedDuration);
          setDuration(parsedDuration);
          setTimeLeft(parsedDuration * 60);
        }
      } catch (error) {
        console.error("Error loading meditation duration:", error);
      }
    }
  }, [userId]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(intervalRef.current as NodeJS.Timeout);
          setIsRunning(false);
          
          toast.success("Meditation session completed!");
          
          if (onComplete) {
            onComplete();
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  // Calculate progress
  useEffect(() => {
    const totalTime = duration * 60;
    const progressPercent = (timeLeft / totalTime) * 100;
    setProgress(progressPercent);
  }, [timeLeft, duration]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start or pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    toast.info("Meditation timer reset");
  };

  // Update timer duration
  const updateDuration = (newDuration: number) => {
    setDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration * 60);
    }
    
    // Save duration to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`meditationDuration-${userId}`, newDuration.toString());
    }
  };

  return isClient ? (
    <Card className="p-4 flex flex-col space-y-4">
      <div className="flex items-center">
        <Heart className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="font-medium">Meditation Timer</h3>
      </div>
      
      {/* Timer Display */}
      <div className="flex flex-col items-center pt-2 pb-2">
        <span className="text-3xl font-bold mb-2">{formatTime(timeLeft)}</span>
        <Progress value={progress} className="h-2 w-full" />
      </div>
      
      {/* Timer Controls */}
      <div className="flex justify-center gap-2">
        <button
          className="h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
          onClick={toggleTimer}
          type="button"
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          className="h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
          onClick={resetTimer}
          disabled={isRunning}
          type="button"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
      
      {/* Duration Adjustment */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Duration (minutes)</span>
          <span className="text-sm">{duration} min</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={duration}
            onChange={(e) => updateDuration(Number(e.target.value))}
            disabled={isRunning}
            className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => updateDuration(Number(e.target.value))}
            disabled={isRunning}
            className="w-16 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          />
        </div>
      </div>
    </Card>
  ) : (
    <Card className="p-4 flex flex-col space-y-4 min-h-[240px]">
      <div className="animate-pulse flex flex-col gap-2">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-20 w-full flex items-center justify-center">
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
      </div>
    </Card>
  );
} 