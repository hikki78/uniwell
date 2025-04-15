import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simple mock music player component for testing
const MusicPlayerComponent = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTrack, setCurrentTrack] = React.useState({
    id: 1,
    title: 'Calm Waters',
    artist: 'Relaxing Music',
    duration: '3:45',
    category: 'meditation'
  });
  const [volume, setVolume] = React.useState(50);
  
  const tracks = [
    { id: 1, title: 'Calm Waters', artist: 'Relaxing Music', duration: '3:45', category: 'meditation' },
    { id: 2, title: 'Forest Sounds', artist: 'Nature Vibes', duration: '4:20', category: 'nature' },
    { id: 3, title: 'Deep Focus', artist: 'Study Mode', duration: '5:30', category: 'focus' }
  ];
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleTrackChange = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };
  
  return (
    <div data-testid="music-player">
      <h1>Wellness Music Player</h1>
      
      <div className="now-playing" data-testid="now-playing">
        <div className="track-info">
          <div className="track-title" data-testid="track-title">{currentTrack.title}</div>
          <div className="track-artist">{currentTrack.artist}</div>
        </div>
        
        <div className="controls">
          <button 
            onClick={handlePlayPause} 
            data-testid="play-pause-button"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={handleVolumeChange}
            data-testid="volume-slider"
          />
        </div>
      </div>
      
      <div className="track-list" data-testid="track-list">
        <h2>Tracks</h2>
        <ul>
          {tracks.map(track => (
            <li 
              key={track.id} 
              onClick={() => handleTrackChange(track)}
              data-testid={`track-${track.id}`}
              className={currentTrack.id === track.id ? 'active' : ''}
            >
              {track.title} - {track.artist}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

describe('Music Player Component', () => {
  it('renders the music player correctly', () => {
    render(<MusicPlayerComponent />);
    
    expect(screen.getByTestId('music-player')).toBeInTheDocument();
    expect(screen.getByText('Wellness Music Player')).toBeInTheDocument();
    expect(screen.getByTestId('now-playing')).toBeInTheDocument();
    expect(screen.getByTestId('track-title')).toBeInTheDocument();
    expect(screen.getByText('Calm Waters')).toBeInTheDocument();
    expect(screen.getByTestId('track-list')).toBeInTheDocument();
    expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
  });
  
  it('changes track when a track is clicked', () => {
    render(<MusicPlayerComponent />);
    
    // Initially shows the first track
    expect(screen.getByText('Calm Waters')).toBeInTheDocument();
    
    // Click the second track
    fireEvent.click(screen.getByTestId('track-2'));
    
    // Should now show the second track
    expect(screen.getByText('Forest Sounds')).toBeInTheDocument();
  });
  
  it('toggles play/pause button', () => {
    render(<MusicPlayerComponent />);
    
    const playPauseButton = screen.getByTestId('play-pause-button');
    
    // Initially shows "Play"
    expect(playPauseButton).toHaveTextContent('Play');
    
    // Click to toggle
    fireEvent.click(playPauseButton);
    
    // Should now show "Pause"
    expect(playPauseButton).toHaveTextContent('Pause');
    
    // Click again to toggle back
    fireEvent.click(playPauseButton);
    
    // Should show "Play" again
    expect(playPauseButton).toHaveTextContent('Play');
  });
}); 