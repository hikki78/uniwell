"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Monitor, Clock, AlertCircle, Settings, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ScreenTimeMonitorProps {
  userId: string;
  onSettingsChange: () => void;
  initialLimit?: number; // in minutes
}

export function ScreenTimeMonitor({ userId, onSettingsChange, initialLimit = 120 }: ScreenTimeMonitorProps) {
  const [isClient, setIsClient] = useState(false);
  const [screenTimeLimit, setScreenTimeLimit] = useState(initialLimit);
  const [screenTimeUsed, setScreenTimeUsed] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [lastActive, setLastActive] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notifyPercentage, setNotifyPercentage] = useState(80);
  
  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load initial state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load screen time data from localStorage
      const storedData = localStorage.getItem(`screenTimeData-${userId}`);
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          // Only use data from today
          const today = new Date().toDateString();
          if (data.date === today) {
            setScreenTimeUsed(data.timeUsed);
            setIsTracking(data.isTracking || false);
          }
        } catch (error) {
          console.error('Error loading screen time data:', error);
        }
      }
      
      // Load screen time limit
      try {
        const storedLimit = localStorage.getItem(`screenTimeLimit-${userId}`);
        if (storedLimit) {
          setScreenTimeLimit(parseInt(storedLimit));
        }
      } catch (error) {
        console.error('Error loading screen time limit:', error);
      }
      
      // Load notification settings
      try {
        const storedSettings = localStorage.getItem(`screenTimeSettings-${userId}`);
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          if (settings.enableNotifications !== undefined) {
            setEnableNotifications(settings.enableNotifications);
          }
          if (settings.notifyPercentage) {
            setNotifyPercentage(settings.notifyPercentage);
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, [userId, initialLimit]);
  
  // Track active time
  useEffect(() => {
    if (!isTracking) return;
    
    const trackTime = () => {
      const now = Date.now();
      const elapsed = now - lastActive;
      
      // Only count if less than 1 minute has passed (user is active)
      if (elapsed < 60000) {
        setScreenTimeUsed(prev => {
          const newTime = prev + elapsed / 60000; // Convert to minutes
          // Save to localStorage
          saveScreenTimeData(newTime);
          return newTime;
        });
      }
      
      setLastActive(now);
    };
    
    // Track time every 10 seconds
    const interval = setInterval(trackTime, 10000);
    
    // Set up event listeners to track user activity
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => setLastActive(Date.now());
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      clearInterval(interval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isTracking, lastActive, userId]);
  
  // Check if screen time limit is reached
  useEffect(() => {
    if (!enableNotifications) return;
    
    const percentUsed = (screenTimeUsed / screenTimeLimit) * 100;
    
    if (percentUsed >= notifyPercentage && !showWarning) {
      setShowWarning(true);
      toast.warning(`You've used ${Math.round(percentUsed)}% of your screen time limit!`, {
        duration: 6000,
      });
    }
    
    if (percentUsed >= 100) {
      toast.error(`Screen time limit reached! Consider taking a break.`, {
        duration: 8000,
      });
    }
    
    // Reset warning flag if under threshold
    if (percentUsed < notifyPercentage && showWarning) {
      setShowWarning(false);
    }
  }, [screenTimeUsed, screenTimeLimit, showWarning, enableNotifications, notifyPercentage]);
  
  // Save screen time data to localStorage
  const saveScreenTimeData = (time: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`screenTimeData-${userId}`, JSON.stringify({
        timeUsed: time,
        isTracking: isTracking,
        date: new Date().toDateString()
      }));
    }
  };
  
  // Format time as hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins}m`;
    }
    
    return `${hours}h ${mins}m`;
  };
  
  // Toggle tracking state
  const toggleTracking = () => {
    const newState = !isTracking;
    setIsTracking(newState);
    
    // Reset lastActive time when starting tracking
    if (newState) {
      setLastActive(Date.now());
    }
    
    // Save tracking state
    saveScreenTimeData(screenTimeUsed);
    
    // Show toast notification
    if (newState) {
      toast.info("Screen time tracking started");
    } else {
      toast.info("Screen time tracking paused");
    }
  };
  
  // Reset screen time counter
  const resetScreenTime = () => {
    setScreenTimeUsed(0);
    saveScreenTimeData(0);
    setShowWarning(false);
    toast.success("Screen time counter reset");
  };
  
  // Update screen time limit
  const updateScreenTimeLimit = (newLimit: number) => {
    setScreenTimeLimit(newLimit);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`screenTimeLimit-${userId}`, newLimit.toString());
    }
    
    // Call the provided callback
    if (onSettingsChange) {
      onSettingsChange();
    }
  };
  
  // Calculate progress percentage (cap at 100%)
  const progressPercent = Math.min(100, (screenTimeUsed / screenTimeLimit) * 100);
  
  // Determine progress color based on usage
  const getProgressColor = () => {
    if (progressPercent >= 90) return "bg-red-500";
    if (progressPercent >= 75) return "bg-orange-500";
    if (progressPercent >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`screenTimeSettings-${userId}`, JSON.stringify({
        enableNotifications: enableNotifications,
        notifyPercentage: notifyPercentage
      }));
      
      // Call the provided callback
      if (onSettingsChange) {
        onSettingsChange();
      }
      
      toast.success("Screen time settings saved");
      setShowSettings(false);
    }
  };
  
  return isClient ? (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">Screen Time</h3>
        </div>
        <div className="flex gap-2">
          <button
            className={`h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium ${isTracking ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}`}
            onClick={toggleTracking}
            type="button"
          >
            {isTracking ? 'Pause' : 'Start'} Tracking
          </button>
          <span 
            className="h-8 w-8 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between py-3">
        <div className="flex gap-1 items-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Today:</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{formatTime(screenTimeUsed)}</span>
          <span className="text-sm text-muted-foreground">/ {formatTime(screenTimeLimit)}</span>
        </div>
      </div>
      
      <Progress 
        value={progressPercent} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
      
      <div className="flex justify-between items-center mt-2">
        <button
          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground bg-transparent rounded"
          onClick={resetScreenTime}
          type="button"
        >
          Reset Counter
        </button>
        
        {progressPercent >= 90 && (
          <div className="flex items-center gap-1 text-red-500 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>Limit almost reached</span>
          </div>
        )}
      </div>
      
      {/* Daily Limit Setting */}
      <div className="mt-4 pt-4 border-t space-y-3">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Daily Limit</span>
          <span className="text-sm font-medium">{formatTime(screenTimeLimit)}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={720}
            step={10}
            value={screenTimeLimit}
            onChange={(e) => updateScreenTimeLimit(Number(e.target.value))}
            className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        </div>
        <div className="flex justify-between gap-2 text-xs text-muted-foreground">
          <span>10m</span>
          <span>4h</span>
          <span>8h</span>
          <span>12h</span>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
          
          <div className="flex justify-between items-center rounded-lg border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Enable Notifications</span>
              <p className="text-xs text-muted-foreground">
                Get notified when reaching your screen time limit
              </p>
            </div>
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
          
          {enableNotifications && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Notification Threshold</span>
                <span className="text-sm">{notifyPercentage}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={notifyPercentage}
                onChange={(e) => setNotifyPercentage(Number(e.target.value))}
                className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={saveSettings}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
            type="button"
          >
            Save Settings
          </button>
        </div>
      )}
    </Card>
  ) : (
    <Card className="p-4 flex flex-col gap-2 min-h-[240px]">
      <div className="animate-pulse flex flex-col gap-2">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
      </div>
    </Card>
  );
} 