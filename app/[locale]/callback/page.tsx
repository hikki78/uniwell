"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSpotifyApi } from '@/lib/spotify';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const api = getSpotifyApi();
        await api.authenticate();
        router.push('/dashboard');
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">
        Connecting to Spotify...
      </div>
    </div>
  );
}
