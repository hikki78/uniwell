import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MeditationTimer } from '@/components/dashboard/MeditationTimer';
import { toast } from 'sonner';

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe('MeditationTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default values', () => {
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Check for main elements
    expect(screen.getByText('Meditation Timer')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('starts and pauses the timer when play/pause button is clicked', () => {
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find buttons by their SVG content
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(button => 
      button.innerHTML.includes('lucide-play')
    );
    
    if (!playButton) {
      throw new Error('Play button not found');
    }

    // Start timer
    fireEvent.click(playButton);

    // Timer should be running, advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should show 9:55
    expect(screen.getByText('09:55')).toBeInTheDocument();

    // Pause timer (same button, now shows pause icon)
    fireEvent.click(playButton);

    // Advance another 5 seconds, but timer should be paused
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Timer should still show 9:55
    expect(screen.getByText('09:55')).toBeInTheDocument();
  });

  it('resets the timer when reset button is clicked', () => {
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find buttons by their SVG content
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(button => 
      button.innerHTML.includes('lucide-play')
    );
    const resetButton = buttons.find(button => 
      button.innerHTML.includes('lucide-rotate-ccw')
    );
    
    if (!playButton || !resetButton) {
      throw new Error('Play or reset button not found');
    }

    // Start timer
    fireEvent.click(playButton);

    // Timer should be running, advance time by 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Timer should show 9:30
    expect(screen.getByText('09:30')).toBeInTheDocument();

    // Click reset button
    fireEvent.click(resetButton);

    // Verify toast was called
    expect(toast.info).toHaveBeenCalledWith("Meditation timer reset");

    // Timer should be reset to 10:00
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('updates duration when slider is adjusted', () => {
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find slider and change value to 20 minutes
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 20 } });

    // Check if duration is updated
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
    
    // Verify localStorage was updated
    expect(localStorage.getItem('meditationDuration-test-user')).toBe('20');
  });

  it('updates duration when input field is changed', () => {
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find number input and change value to 15
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 15 } });

    // Check if duration is updated
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('calls onComplete callback when timer finishes', () => {
    const onCompleteMock = jest.fn();
    render(<MeditationTimer userId="test-user" onComplete={onCompleteMock} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Set duration to 1 minute for faster testing
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 1 } });

    // Find buttons by their SVG content
    const buttons = screen.getAllByRole('button');
    const playButton = buttons.find(button => 
      button.innerHTML.includes('lucide-play')
    );
    
    if (!playButton) {
      throw new Error('Play button not found');
    }

    // Start timer
    fireEvent.click(playButton);

    // Advance time to complete the timer (1 minute + 1 second)
    act(() => {
      jest.advanceTimersByTime(61000);
    });

    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Meditation session completed!");
  });
  
  it('loads saved duration from localStorage', () => {
    // Set up localStorage with saved duration
    localStorage.setItem('meditationDuration-test-user', '25');
    
    render(<MeditationTimer userId="test-user" />);
    
    // Use act to trigger the isClient state update and useEffect for loading
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Check if duration is loaded from localStorage
    expect(screen.getByText('25 min')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
}); 