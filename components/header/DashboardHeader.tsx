"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { logout } from "@/lib/auth";
import { OpenSidebar } from "./OpenSidebar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { NotificationContainer } from "@/components/notifications/NotificationContainer";

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string>("");
  
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Check if we're running on the server during static generation
  const isStatic = typeof window === 'undefined' && process.env.NODE_ENV === 'production';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* Sidebar toggle button for mobile */}
            <div className="mr-2">
              <OpenSidebar />
            </div>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image 
                src="/images/unilogo.png" 
                alt="UniWell Logo" 
                width={24} 
                height={24} 
                className="h-6 w-auto"
                priority
              />
              <span className="text-xl font-bold">UniWell</span>
            </Link>
            
            {/* Desktop navigation */}
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
            {/* Mobile menu toggle */}
            <Button 
              onClick={toggleMobileMenu} 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {!isStatic && userId && <NotificationContainer userId={userId} />}
            
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
              className="hidden md:flex hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border/40 py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/dashboard" 
              className="font-medium py-2 text-sm hover:text-purple-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/assigned-to-me" 
              className="text-muted-foreground py-2 text-sm hover:text-purple-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Workspace
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-muted-foreground py-2 text-sm hover:text-purple-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <Button 
              onClick={handleLogout} 
              variant="ghost"
              size="sm"
              className="w-full justify-start px-0 hover:bg-transparent hover:text-purple-600"
            >
              Logout
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
