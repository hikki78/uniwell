"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveSpotifyToken } from "@/lib/spotify";

export default function SpotifyAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (!searchParams) return;
    
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresIn = searchParams.get("expires_in");
    
    if (accessToken && expiresIn) {
      // Save tokens to localStorage
      saveSpotifyToken(
        accessToken,
        parseInt(expiresIn),
        refreshToken || undefined
      );
      
      // Redirect back to dashboard
      router.push("/dashboard");
    } else {
      // If no tokens, redirect to dashboard with error
      router.push("/dashboard?error=spotify_missing_tokens");
    }
  }, [router, searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold">Connecting to Spotify...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
}
