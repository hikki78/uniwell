"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get the current locale from the URL path
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const locale = pathParts.length > 1 ? pathParts[1] : 'en';
    
    // Redirect to the work-in-progress page with the correct locale
    router.push(`/${locale}/work-in-progress`);
  }, [router]);

  // Return empty div while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground animate-pulse">Redirecting...</p>
    </div>
  );
} 