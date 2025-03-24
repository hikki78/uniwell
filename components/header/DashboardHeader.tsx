"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { logout } from "@/lib/auth";

export function DashboardHeader() {
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold">UniWell</span>
            </Link>
            
            <nav className="hidden md:flex items-center ml-10">
              <Link 
                href="/dashboard" 
                className="font-medium px-4 py-2 text-sm hover:text-purple-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/assigned-to-me" 
                className="text-muted-foreground px-4 py-2 text-sm hover:text-purple-600 transition-colors"
              >
                Workspace
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="text-muted-foreground px-4 py-2 text-sm hover:text-purple-600 transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeSwitcher 
              alignHover="end"
              alignDropdown="end"
              size={"icon"}
              variant={"outline"}
            />
            <Button 
              onClick={handleLogout} 
              variant="ghost"
              size="sm"
              className="hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
