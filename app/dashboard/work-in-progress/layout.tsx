"use client";

import { ThemeProvider } from "next-themes";

// Add an SSR flag for use in static building
const isSSR = typeof window === 'undefined';

export default function WorkInProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For static generation, return a minimal layout
  if (isSSR && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
} 