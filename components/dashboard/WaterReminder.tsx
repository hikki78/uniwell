"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplet, Bell, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface WaterReminderProps {
  userId: string;
  onSettingsChange?: () => void;
}

export function WaterReminder({ userId, onSettingsChange }: WaterReminderProps) {
  const [isClient, setIsClient] = useState(false);
  // Reminder state
  const [reminderInterval, setReminderInterval] = useState(60); // in minutes
  const [timeUntilNextReminder, setTimeUntilNextReminder] = useState(60 * 60); // in seconds
  const [isReminderActive, setIsReminderActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load reminder data
        const reminderData = localStorage.getItem(`waterReminder-${userId}`);
        if (reminderData) {
          const data = JSON.parse(reminderData);
          // Only use data from today
          const today = new Date().toDateString();
          if (data.date === today) {
            // If there's a last reminder time, calculate time until next reminder
            if (data.lastReminderTime) {
              const lastTime = new Date(data.lastReminderTime).getTime();
              const now = new Date().getTime();
              const elapsedSeconds = Math.floor((now - lastTime) / 1000);
              const intervalSeconds = data.reminderInterval * 60;
              const remainingSeconds = Math.max(0, intervalSeconds - elapsedSeconds);
              setTimeUntilNextReminder(remainingSeconds);
            }
            
            // Load reminder status
            if (data.isReminderActive !== undefined) {
              setIsReminderActive(data.isReminderActive);
            }
            
            // Load reminder interval
            if (data.reminderInterval) {
              setReminderInterval(data.reminderInterval);
            }
          }
        }
      } catch (error) {
        console.error("Error loading reminder data:", error);
      }
    }
  }, [userId]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!isClient || !isReminderActive) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeUntilNextReminder(prev => {
        if (prev <= 1) {
          // Time to remind!
          showWaterReminder();
          
          // Reset timer to reminder interval
          const newTime = reminderInterval * 60;
          saveReminderData(newTime);
          return newTime;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isClient, isReminderActive, reminderInterval]);
  
  // Show water reminder notification
  const showWaterReminder = () => {
    // Try to use native notifications if available and permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Time to drink water! 💧', {
        body: 'Stay hydrated for better focus and energy.',
        icon: '/water-icon.png'
      });
    }
    
    // Always use toast notification as fallback
    toast("Time to drink water! 💧", {
      description: "Stay hydrated for better focus and energy.",
      duration: 10000,
    });
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success("Water reminder notifications enabled!");
        }
      }
    }
  };
  
  // Toggle reminders
  const toggleReminders = () => {
    const newState = !isReminderActive;
    setIsReminderActive(newState);
    
    if (newState) {
      // When activating, request notification permission
      requestNotificationPermission();
      
      // Reset the timer to full interval
      const newTime = reminderInterval * 60;
      setTimeUntilNextReminder(newTime);
      saveReminderData(newTime);
      
      toast.success("Water reminders activated");
    } else {
      toast.info("Water reminders paused");
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    // Reset the timer
    const newTime = reminderInterval * 60;
    setTimeUntilNextReminder(newTime);
    saveReminderData(newTime);
    
    toast.info("Timer reset");
  };
  
  // Save reminder data to localStorage
  const saveReminderData = (timeRemaining: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterReminder-${userId}`, JSON.stringify({
        lastReminderTime: new Date().toISOString(),
        reminderInterval: reminderInterval,
        isReminderActive: isReminderActive,
        date: new Date().toDateString()
      }));
    }
  };
  
  // Update reminder interval
  const updateReminderInterval = (minutes: number) => {
    setReminderInterval(minutes);
    
    // Reset the timer with new interval
    const newTime = minutes * 60;
    setTimeUntilNextReminder(newTime);
    saveReminderData(newTime);
    
    toast.success(`Reminder interval set to ${minutes} minutes`);
    
    // Call the callback if provided
    if (onSettingsChange) {
      onSettingsChange();
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return isClient ? (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Droplet className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium">Water Reminder</h3>
        </div>
        <button
          className={`p-2 rounded-full ${isReminderActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
          onClick={toggleReminders}
          type="button"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex flex-col items-center py-6">
        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-blue-500">
            {isReminderActive ? formatTime(timeUntilNextReminder) : "Paused"}
          </span>
          <div className="text-sm text-muted-foreground mt-1">
            until next reminder
          </div>
        </div>
        
        <Progress
          value={isReminderActive ? 100 - ((timeUntilNextReminder / (reminderInterval * 60)) * 100) : 0}
          className="h-2 w-full"
          indicatorClassName="bg-gradient-to-r from-blue-300 to-blue-500"
        />
      </div>
      
      <div className="flex justify-between">
        <span className="text-sm font-medium">Reminder every {reminderInterval} minutes</span>
        <button
          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          onClick={resetTimer}
          type="button"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      
      {/* Reminder interval setting */}
      <div className="mt-3 pt-3 border-t space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Reminder Interval</span>
        </div>
        <div className="flex justify-between gap-1 mt-1">
          {[15, 30, 45, 60, 90, 120].map((minutes) => (
            <button
              key={minutes}
              className={`p-1 h-8 text-xs flex-1 rounded-md border ${reminderInterval === minutes ? 'bg-secondary text-secondary-foreground' : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => updateReminderInterval(minutes)}
              type="button"
            >
              {minutes}min
            </button>
          ))}
        </div>
      </div>
    </Card>
  ) : (
    <Card className="p-4 flex flex-col gap-3 min-h-[240px]">
      <div className="animate-pulse flex flex-col gap-2">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 w-full flex items-center justify-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
      </div>
    </Card>
  );
} 