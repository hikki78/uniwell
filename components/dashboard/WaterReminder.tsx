"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplet, Bell, RotateCcw, Plus, Minus, Settings } from "lucide-react";
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
  // Water intake state
  const [waterAmount, setWaterAmount] = useState(0); // in ml
  const [waterGoal, setWaterGoal] = useState(2000); // in ml
  
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
            
            // Load water amount
            if (data.waterAmount !== undefined) {
              setWaterAmount(data.waterAmount);
            }
          }
        }
        
        // Load water goal
        const waterGoalData = localStorage.getItem(`waterGoal-${userId}`);
        if (waterGoalData) {
          setWaterGoal(parseInt(waterGoalData));
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
      const notification = new Notification('Time to drink water! 💧', {
        body: 'Stay hydrated for better focus and energy.',
        icon: '/water-icon.png'
      });
      
      // Add event listener to add water when notification is clicked
      notification.addEventListener('click', () => {
        addWater(250);
      });
    }
    
    // Always use toast notification as fallback
    toast("Time to drink water! 💧", {
      description: "Stay hydrated for better focus and energy.",
      duration: 10000,
      action: {
        label: "Drink water",
        onClick: () => addWater(250)
      }
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
  
  // Add water amount
  const addWater = (amount: number) => {
    const newAmount = waterAmount + amount;
    setWaterAmount(newAmount);
    
    // Reset the timer when water is added
    resetTimer();
    
    // Save to localStorage with the updated water amount
    saveReminderData(timeUntilNextReminder, newAmount);
    
    toast.success(`Added ${amount}ml of water`, {
      description: `Total: ${newAmount}ml / ${waterGoal}ml`,
    });
    
    // Call the callback if provided
    if (onSettingsChange) {
      onSettingsChange();
    }
  };
  
  // Reset water counter
  const resetWater = () => {
    setWaterAmount(0);
    saveReminderData(timeUntilNextReminder, 0);
    
    toast.info("Water intake reset");
    
    // Call the callback if provided
    if (onSettingsChange) {
      onSettingsChange();
    }
  };
  
  // Save reminder data to localStorage
  const saveReminderData = (timeRemaining: number, newWaterAmount?: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterReminder-${userId}`, JSON.stringify({
        lastReminderTime: new Date().toISOString(),
        reminderInterval: reminderInterval,
        isReminderActive: isReminderActive,
        waterAmount: newWaterAmount !== undefined ? newWaterAmount : waterAmount,
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
  
  // Format water amount display
  const formatWaterAmount = () => {
    return waterAmount >= 1000 
      ? `${(waterAmount/1000).toFixed(1)}L / ${(waterGoal/1000).toFixed(1)}L` 
      : `${waterAmount}ml / ${waterGoal}ml`;
  };
  
  // Calculate water progress percentage
  const waterProgressPercentage = Math.min(100, (waterAmount / waterGoal) * 100);
  
  // Update water goal
  const updateWaterGoal = (newGoal: number) => {
    setWaterGoal(newGoal);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`waterGoal-${userId}`, newGoal.toString());
    }
    
    toast.success(`Water goal updated to ${newGoal >= 1000 ? `${(newGoal/1000).toFixed(1)}L` : `${newGoal}ml`}`);
    
    // Call the callback if provided
    if (onSettingsChange) {
      onSettingsChange();
    }
  };
  
  // Handle custom water goal
  const [customGoalInput, setCustomGoalInput] = useState<string>('');
  const [showWaterSettings, setShowWaterSettings] = useState(false);
  
  const handleCustomGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomGoalInput(value);
  };
  
  const handleCustomGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = parseInt(customGoalInput);
    if (newGoal > 0) {
      updateWaterGoal(newGoal);
      setCustomGoalInput('');
    } else {
      toast.error("Please enter a valid goal");
    }
  };
  
  // Toggle settings
  const toggleWaterSettings = () => {
    setShowWaterSettings(!showWaterSettings);
  };
  
  return isClient ? (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Droplet className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium">Water Reminder</h3>
        </div>
        <div className="flex gap-1">
          <button
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            onClick={toggleWaterSettings}
            type="button"
            title="Water Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            className={`p-2 rounded-full ${isReminderActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            onClick={toggleReminders}
            type="button"
            title={isReminderActive ? "Pause Reminders" : "Activate Reminders"}
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Water Settings Panel */}
      {showWaterSettings && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Water Goal Settings</h4>
          </div>
          
          <div className="space-y-3">
            {/* Quick preset buttons */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Common Goals</div>
              <div className="flex gap-1 w-full">
                {[1500, 2000, 2500, 3000].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => updateWaterGoal(goal)}
                    className={`px-2 py-1 rounded text-xs flex-1 transition-colors ${
                      waterGoal === goal 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                    type="button"
                  >
                    {goal >= 1000 ? `${(goal/1000).toFixed(1)}L` : `${goal}ml`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom goal input */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Custom Goal (ml)</div>
              <form onSubmit={handleCustomGoalSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customGoalInput}
                  onChange={handleCustomGoalChange}
                  placeholder="e.g., 1800"
                  className="flex-1 h-8 px-2 text-sm rounded-md border border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="h-8 px-3 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
                  disabled={!customGoalInput}
                >
                  Set
                </button>
              </form>
            </div>
            
            <div className="text-xs text-muted-foreground pt-1">
              Current Goal: <span className="font-medium text-blue-600">{waterGoal >= 1000 ? `${(waterGoal/1000).toFixed(1)}L` : `${waterGoal}ml`}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center py-4">
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
          // @ts-ignore
          indicatorClassName="bg-gradient-to-r from-blue-300 to-blue-500"
        />
      </div>
      
      {/* Water intake tracking */}
      <div className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex justify-between w-full mb-2">
          <span className="text-sm font-medium">Water Intake</span>
          <span className="text-sm text-blue-600">
            {formatWaterAmount()}
          </span>
        </div>
        
        <Progress
          value={waterProgressPercentage}
          className="h-2 w-full mb-3"
          // @ts-ignore
          indicatorClassName="bg-gradient-to-r from-sky-400 to-blue-600"
        />
        
        <div className="flex justify-between w-full">
          <div className="flex gap-1">
            <button
              onClick={() => addWater(250)}
              className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
              type="button"
            >
              +250ml
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-2 py-1 rounded bg-blue-200 hover:bg-blue-300 text-blue-700 text-xs"
              type="button"
            >
              +500ml
            </button>
          </div>
          <button
            onClick={resetWater}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
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