"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/work-in-progress");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground animate-pulse">Redirecting...</p>
    </div>
  );
} 