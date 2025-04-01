import { cache } from 'react';

const SOUNDCLOUD_API_KEY = '00aef2aeb5msh7fe88d267172891p16d646jsn687c6dca108c';

export const TRACKS = [
  {
    id: 'soundcloud:tracks:1579438050',
    title: 'Deep Focus',
    artist: 'Focus Music'
  },
  {
    id: 'soundcloud:tracks:1234567890',
    title: 'Calm Meditation',
    artist: 'Relaxation'
  },
  {
    id: 'soundcloud:tracks:9876543210',
    title: 'Energy Boost',
    artist: 'Workout Mix'
  }
];

export const getMusicStream = cache(async (trackId: string) => {
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': SOUNDCLOUD_API_KEY,
      'x-rapidapi-host': 'soundcloud-api3.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(
      `https://soundcloud-api3.p.rapidapi.com/tracks/${trackId}/stream`,
      options
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching music stream:', error);
    return null;
  }
});
