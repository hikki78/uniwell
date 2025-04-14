import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }

    // For now, we'll use a mock response
    // In a production app, you would implement a real YouTube API integration here
    // using YouTube Data API v3 with your own API key
    const mockResults = generateMockResults(query);
    
    return NextResponse.json({ tracks: mockResults });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}

// Generate mock search results for demonstration
function generateMockResults(query: string) {
  const normalizedQuery = query.toLowerCase();
  
  // List of mock tracks
  const mockTracks = [
    {
      id: 'mock-1',
      title: `${query} - Relaxing Mix`,
      artist: 'Study Music',
      thumbnail: 'https://picsum.photos/seed/music1/200',
      videoId: 'jfKfPfyJRdk', // lofi hip hop radio
    },
    {
      id: 'mock-2',
      title: `Top ${query} Hits 2023`,
      artist: 'Music Channel',
      thumbnail: 'https://picsum.photos/seed/music2/200',
      videoId: '5qap5aO4i9A', // lofi girl
    },
    {
      id: 'mock-3',
      title: `${query} Piano Classics`,
      artist: 'Classical Music',
      thumbnail: 'https://picsum.photos/seed/music3/200',
      videoId: 'DWcJFNfaw9c', // piano music
    },
    {
      id: 'mock-4',
      title: `${query} for Working & Studying`,
      artist: 'Focus Channel',
      thumbnail: 'https://picsum.photos/seed/music4/200',
      videoId: '21qNxnCS8WU', // ambient music
    },
    {
      id: 'mock-5',
      title: `${query} Meditation Music`,
      artist: 'Meditation Zone',
      thumbnail: 'https://picsum.photos/seed/music5/200',
      videoId: 'lFcSrYw-ARY', // meditation music
    },
  ];
  
  // Return all results but make it seem like they match the query
  return mockTracks;
} 