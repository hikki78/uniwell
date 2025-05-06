"use client";

import { ThemeProvider } from "next-themes";

export default function WorkInProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ThemeProvider>
  );
} 