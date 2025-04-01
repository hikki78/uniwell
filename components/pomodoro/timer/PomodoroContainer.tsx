"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pathsToSoundEffects, cn } from "@/lib/utils";
import { PomodoroSettings } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Howl } from "howler";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface Props {
  pomodoroSettings: PomodoroSettings;
}

export const PomodoContainer = ({
  pomodoroSettings: {
    longBreakDuration,
    longBreakInterval,
    rounds,
    shortBreakDuration,
    workDuration,
    soundEffect,
    soundEffectVolume,
  },
}: Props) => {
  const [timer, setTimer] = useState({ minutes: workDuration, seconds: 0 });
  const [isTimerRunning, setIsTimmerRunning] = useState(false);
  const [completedIntervals, setCompletedIntervals] = useState(1);

  const [isBreakTime, setIsBreakTime] = useState(false);
  const [currentRounds, setCurrentRounds] = useState(1);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  // Calculate progress percentage for the circular timer
  const totalSeconds = useMemo(() => {
    if (isBreakTime) {
      return completedIntervals === longBreakInterval 
        ? longBreakDuration * 60 
        : shortBreakDuration * 60;
    }
    return workDuration * 60;
  }, [isBreakTime, completedIntervals, longBreakDuration, longBreakInterval, shortBreakDuration, workDuration]);
  
  const currentSeconds = useMemo(() => {
    return timer.minutes * 60 + timer.seconds;
  }, [timer.minutes, timer.seconds]);
  
  const progress = useMemo(() => {
    return (currentSeconds / totalSeconds) * 100;
  }, [currentSeconds, totalSeconds]);

  const handleTimer = useCallback(() => {
    setIsTimmerRunning(false);

    if (isBreakTime) {
      setTimer({ minutes: workDuration, seconds: 0 });
      setIsBreakTime(false);
      setCompletedIntervals((prev) => prev + 1);
      completedIntervals === 0 && setCurrentRounds((prev) => prev + 1);
    } else {
      setIsBreakTime(true);
      if (completedIntervals === longBreakInterval) {
        setTimer({ minutes: longBreakDuration, seconds: 0 });
        setCompletedIntervals(0);
      } else {
        setTimer({ minutes: shortBreakDuration, seconds: 0 });
      }
    }

    const currentPath = pathsToSoundEffects[soundEffect];

    const sound = new Howl({
      src: currentPath,
      html5: true,
      volume: soundEffectVolume,
    });

    sound.play();
  }, [
    isBreakTime,
    completedIntervals,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    workDuration,
    soundEffect,
    soundEffectVolume,
  ]);

  const t = useTranslations("POMODORO.TIMER");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && currentRounds <= rounds) {
      interval = setInterval(() => {
        if (timer.minutes === 0 && timer.seconds === 0) {
          clearInterval(interval);
          handleTimer();
        } else {
          if (timer.seconds === 0) {
            setTimer((prev) => {
              return {
                ...prev,
                minutes: prev.minutes - 1,
              };
            });
            setTimer((prev) => {
              return {
                ...prev,
                seconds: 59,
              };
            });
          } else {
            setTimer((prev) => {
              return {
                ...prev,
                seconds: prev.seconds - 1,
              };
            });
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [
    isTimerRunning,
    timer,
    isBreakTime,
    currentRounds,
    completedIntervals,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    workDuration,
    handleTimer,
    rounds,
  ]);

  const formattedMinutes = useMemo(
    () => (timer.minutes < 10 ? `0${timer.minutes}` : timer.minutes),
    [timer.minutes]
  );

  const formattedSeconds = useMemo(
    () => (timer.seconds < 10 ? `0${timer.seconds}` : timer.seconds),
    [timer.seconds]
  );

  const resetPomodoro = useCallback(() => {
    setTimer({ minutes: workDuration, seconds: 0 });
    setIsBreakTime(false);
    setCurrentRounds(1);
    setCompletedIntervals(1);
  }, [workDuration]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-6">
      {/* Mode selector buttons */}
      <div className={cn(
        "flex rounded-full p-1 mb-10 shadow-lg overflow-hidden",
        isDarkMode 
          ? "bg-background/10 backdrop-blur-md border border-white/5" 
          : "bg-white/80 backdrop-blur-md border border-gray-200"
      )}>
        <AnimatePresence mode="wait" initial={false}>
          <Button 
            variant="ghost"
            className={cn(
              "relative rounded-full px-8 py-2.5 text-sm font-medium z-10 transition-all duration-300",
              !isBreakTime ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              if (isBreakTime) {
                setIsTimmerRunning(false);
                setTimer({ minutes: workDuration, seconds: 0 });
                setIsBreakTime(false);
              }
            }}
          >
            {!isBreakTime && (
              <motion.div 
                className={cn(
                  "absolute inset-0 rounded-full z-0",
                  isDarkMode
                    ? "bg-gradient-to-r from-primary to-primary/80" 
                    : "bg-gradient-to-r from-primary to-primary/90"
                )}
                layoutId="tab-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t("FOCUS")}</span>
          </Button>
          <Button 
            variant="ghost"
            className={cn(
              "relative rounded-full px-8 py-2.5 text-sm font-medium z-10 transition-all duration-300",
              isBreakTime ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              if (!isBreakTime) {
                setIsTimmerRunning(false);
                setTimer({ minutes: shortBreakDuration, seconds: 0 });
                setIsBreakTime(true);
              }
            }}
          >
            {isBreakTime && (
              <motion.div 
                className={cn(
                  "absolute inset-0 rounded-full z-0",
                  isDarkMode
                    ? "bg-gradient-to-r from-primary to-primary/80" 
                    : "bg-gradient-to-r from-primary to-primary/90"
                )}
                layoutId="tab-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t("BREAK")}</span>
          </Button>
        </AnimatePresence>
      </div>

      {/* Circular timer */}
      {currentRounds <= rounds ? (
        <div className="relative flex items-center justify-center">
          {/* Glass effect background */}
          <div className={cn(
            "absolute inset-0 rounded-full backdrop-blur-xl z-0",
            isDarkMode 
              ? "bg-gradient-to-b from-background/20 to-background/5 shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-white/10" 
              : "bg-gradient-to-b from-white/80 to-white/60 shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-gray-200/80"
          )}></div>
          
          {/* SVG for circular progress */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 p-6">
            {/* Glow effect */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full blur-xl transition-opacity duration-1000",
                isBreakTime 
                  ? isDarkMode ? "bg-blue-500" : "bg-blue-400" 
                  : isDarkMode ? "bg-primary" : "bg-primary",
                isTimerRunning 
                  ? isDarkMode ? "opacity-40" : "opacity-20" 
                  : isDarkMode ? "opacity-20" : "opacity-10"
              )}
            ></div>
            
            {/* Background circle */}
            <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isBreakTime 
                    ? isDarkMode ? "#3b82f6" : "#2563eb" 
                    : isDarkMode ? "#f43f5e" : "#e11d48"} />
                  <stop offset="100%" stopColor={isBreakTime 
                    ? isDarkMode ? "#60a5fa" : "#3b82f6" 
                    : isDarkMode ? "#fb7185" : "#f43f5e"} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Background track */}
              <circle
                className={cn(
                  "stroke-current",
                  isDarkMode ? "text-white/10" : "text-gray-300/50"
                )}
                strokeWidth="4"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
              />
              
              {/* Progress circle with gradient */}
              <circle
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="transparent"
                r="44"
                cx="50"
                cy="50"
                filter="url(#glow)"
                style={{
                  strokeDasharray: `${2 * Math.PI * 44}`,
                  strokeDashoffset: `${2 * Math.PI * 44 * (1 - progress / 100)}`,
                  transformOrigin: 'center',
                  transform: 'rotate(-90deg)',
                  transition: 'stroke-dashoffset 0.5s ease'
                }}
              />
            </svg>
            
            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                key={`${formattedMinutes}:${formattedSeconds}`}
                initial={{ opacity: 0.8, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-6xl md:text-8xl font-bold tracking-wider drop-shadow-md",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                {formattedMinutes}:{formattedSeconds}
              </motion.div>
              
              <motion.p 
                className={cn(
                  "text-sm md:text-base mt-2 uppercase tracking-widest font-medium",
                  isBreakTime 
                    ? isDarkMode ? "text-blue-200" : "text-blue-600" 
                    : isDarkMode ? "text-pink-200" : "text-pink-600"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isBreakTime ? t("BREAK") : t("FOCUS")}
              </motion.p>
              
              {/* Control buttons inside the circle */}
              <div className="flex items-center gap-6 mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      setIsTimmerRunning((prev) => !prev);
                    }}
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "rounded-full h-14 w-14 backdrop-blur-md shadow-lg",
                      isDarkMode 
                        ? isTimerRunning 
                          ? "bg-white/10 hover:bg-white/20 text-white border border-white/10" 
                          : "bg-gradient-to-br from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 border border-white/10"
                        : isTimerRunning 
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200" 
                          : "bg-gradient-to-br from-primary to-primary/90 text-white hover:from-primary/80 hover:to-primary/70 border border-transparent"
                    )}
                  >
                    {isTimerRunning ? 
                      <Pause className="h-6 w-6" /> : 
                      <Play className="h-6 w-6 ml-0.5" />}
                  </Button>
                </motion.div>
                
                {isTimerRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleTimer}
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "rounded-full h-10 w-10 backdrop-blur-md shadow-md",
                        isDarkMode 
                          ? "bg-white/10 hover:bg-white/20 text-white/80 border border-white/10" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
                      )}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "flex flex-col items-center justify-center p-10 rounded-2xl backdrop-blur-xl shadow-lg",
            isDarkMode 
              ? "bg-gradient-to-b from-background/30 to-background/10 border border-white/10" 
              : "bg-gradient-to-b from-white/90 to-white/70 border border-gray-200"
          )}
        >
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={cn(
              "text-4xl font-bold mb-8 drop-shadow-md",
              isDarkMode ? "text-white" : "text-gray-900"
            )}
          >
            {t("END_TEXT")}
          </motion.h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={resetPomodoro}
              size="lg"
              className={cn(
                "bg-gradient-to-r text-white text-xl px-8 py-6 rounded-xl shadow-lg",
                isDarkMode 
                  ? "from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border border-white/10" 
                  : "from-primary to-primary/90 hover:from-primary/80 hover:to-primary/70 border border-transparent"
              )}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              {t("NEW")}
            </Button>
          </motion.div>
        </motion.div>
      )}
      
      {/* Rounds indicator */}
      {currentRounds <= rounds && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={cn(
            "mt-10 text-center backdrop-blur-md px-6 py-3 rounded-full shadow-md",
            isDarkMode 
              ? "bg-background/10 border border-white/5" 
              : "bg-white/80 border border-gray-200"
          )}
        >
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-white/70" : "text-gray-600"
          )}>
            {t("ROUNDS.FIRST")} <span className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{currentRounds}</span>{" "}
            {t("ROUNDS.SECOND")} <span className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{rounds}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};
