"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function NotFound() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-lg border-purple-200 animate-pulse">
        <div className="mx-auto w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
          Work In Progress
        </h1>
        
        <div className="text-lg text-muted-foreground">
          <p>We're building something amazing for you!</p>
          <p className="mt-2 font-mono">{`< ${dots} >`}</p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button 
            asChild
            variant="default" 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 