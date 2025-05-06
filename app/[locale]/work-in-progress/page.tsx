"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function WorkInProgressPage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh]">
      <Card className="w-full max-w-2xl p-6 text-center space-y-6 shadow-lg">
        <div className="mx-auto w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
          <Zap className="h-12 w-12 text-purple-600" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Work In Progress</h1>
        
        <p className="text-lg text-muted-foreground">
          We're currently updating the Dashboard with exciting new features. 
          Please check back soon!
        </p>
        
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            className="mr-4"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => router.push("/")}
          >
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
} 