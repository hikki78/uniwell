"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Stars } from "lucide-react";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import Image from "next/image";
import Link from "next/link";

// Add a static export configuration
export const dynamic = 'error'; // Force errors if this page tries to be dynamic
export const revalidate = false; // Don't revalidate this page

export default function WorkInProgressPage() {
  const [dots, setDots] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Generate random positions for sparkles
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 2
  }));

  // During static generation, return a simpler version without client-side features
  if (!isMounted && typeof window === 'undefined') {
    return (
      <>
        <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden">
          <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl">
              <div className="relative p-8 rounded-xl bg-white/80 dark:bg-purple-950/80 backdrop-blur-lg shadow-xl border border-purple-200 dark:border-purple-800">
                <div className="mx-auto w-32 h-32 mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Image 
                      src="/images/unilogo.png" 
                      alt="UniWell Logo" 
                      width={80} 
                      height={80} 
                      className="h-16 w-auto"
                      priority
                    />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                  Work In Progress
                </h1>
                <div className="text-center text-lg text-gray-700 dark:text-gray-300 mb-8">
                  <p className="mb-2">We're building something amazing for you!</p>
                </div>
                <div className="flex justify-center">
                  <Link 
                    href="/"
                    className="relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 group"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden">
        {/* Animated background sparkles */}
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute text-purple-300 dark:text-purple-400"
            style={{
              top: `${sparkle.y}%`,
              left: `${sparkle.x}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, sparkle.scale, 0] 
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              delay: sparkle.delay,
              ease: "easeInOut"
            }}
          >
            <Stars className="h-4 w-4" />
          </motion.div>
        ))}
        
        <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center h-full">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative p-8 rounded-xl bg-white/80 dark:bg-purple-950/80 backdrop-blur-lg shadow-xl border border-purple-200 dark:border-purple-800">
              {/* Logo */}
              <motion.div 
                className="mx-auto w-32 h-32 mb-6 relative"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Image 
                    src="/images/unilogo.png" 
                    alt="UniWell Logo" 
                    width={80} 
                    height={80} 
                    className="h-16 w-auto"
                    priority
                  />
                </div>
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 dark:border-t-purple-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              
              {/* Title with animation */}
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Work In Progress
              </motion.h1>
              
              {/* Message with typing animation */}
              <motion.div 
                className="text-center text-lg text-gray-700 dark:text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <p className="mb-2">We're building something amazing for you!</p>
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-spin" />
                  <p className="font-mono">{`< ${dots} >`}</p>
                </div>
              </motion.div>
              
              {/* Animated button */}
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link 
                  href="/"
                  className="relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Return Home
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100"
                    initial={{ x: "100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </Link>
              </motion.div>
              
              {/* Theme switcher */}
              <div className="absolute top-4 right-4">
                <ThemeSwitcher 
                  alignHover="end"
                  alignDropdown="end"
                  size="icon"
                  variant="ghost"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 