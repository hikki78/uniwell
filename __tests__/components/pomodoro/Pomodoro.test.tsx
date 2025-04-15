import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Mock timer functions
jest.useFakeTimers();

// Create a simple mock pomodoro component for testing
const PomodoroComponent = () => {
  const [mode, setMode] = React.useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = React.useState(false);
  const [cycles, setCycles] = React.useState(0);
  const [settings, setSettings] = React.useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    sound: true
  });
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    
    switch (mode) {
      case 'focus':
        setTimeLeft(settings.focusTime * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakTime * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakTime * 60);
        break;
    }
  };
  
  const changeMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    
    switch (newMode) {
      case 'focus':
        setTimeLeft(settings.focusTime * 60);
        break;
      case 'shortBreak':
        setTimeLeft(settings.shortBreakTime * 60);
        break;
      case 'longBreak':
        setTimeLeft(settings.longBreakTime * 60);
        break;
    }
  };
  
  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (mode === 'focus') {
        // Increment completed cycles
        const newCycles = cycles + 1;
        setCycles(newCycles);
        
        // Determine next break type
        if (newCycles % settings.longBreakInterval === 0) {
          // Time for a long break
          setMode('longBreak');
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          // Short break
          setMode('shortBreak');
          setTimeLeft(settings.shortBreakTime * 60);
        }
        
        // Auto-start break if enabled
        setIsActive(settings.autoStartBreaks);
        
      } else {
        // Break completed, back to focus
        setMode('focus');
        setTimeLeft(settings.focusTime * 60);
        
        // Auto-start next pomodoro if enabled
        setIsActive(settings.autoStartPomodoros);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, cycles, settings]);
  
  return (
    <div data-testid="pomodoro-component" className={`pomodoro-container ${mode}`}>
      <h1>Pomodoro Timer</h1>
      
      <div className="timer-modes">
        <button 
          className={mode === 'focus' ? 'active' : ''} 
          onClick={() => changeMode('focus')}
          data-testid="focus-mode-button"
        >
          Focus
        </button>
        <button 
          className={mode === 'shortBreak' ? 'active' : ''} 
          onClick={() => changeMode('shortBreak')}
          data-testid="short-break-button"
        >
          Short Break
        </button>
        <button 
          className={mode === 'longBreak' ? 'active' : ''} 
          onClick={() => changeMode('longBreak')}
          data-testid="long-break-button"
        >
          Long Break
        </button>
      </div>
      
      <div className="timer-display" data-testid="timer-display">
        {formatTime(timeLeft)}
      </div>
      
      <div className="timer-controls">
        <button 
          onClick={toggleTimer}
          data-testid="start-stop-button"
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          data-testid="reset-button"
        >
          Reset
        </button>
      </div>
      
      <div className="cycles-display">
        <span data-testid="cycles-count">Pomodoros completed: {cycles}</span>
      </div>
    </div>
  );
};

describe('Pomodoro Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });
  
  it('renders the pomodoro timer correctly', () => {
    render(<PomodoroComponent />);
    
    expect(screen.getByTestId('pomodoro-component')).toBeInTheDocument();
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument();
    expect(screen.getByTestId('focus-mode-button')).toBeInTheDocument();
    expect(screen.getByTestId('short-break-button')).toBeInTheDocument();
    expect(screen.getByTestId('long-break-button')).toBeInTheDocument();
    expect(screen.getByTestId('timer-display')).toBeInTheDocument();
    expect(screen.getByTestId('start-stop-button')).toHaveTextContent('Start');
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });
  
  it('starts and pauses the timer', () => {
    render(<PomodoroComponent />);
    
    // Initial timer display should show 25:00
    expect(screen.getByTestId('timer-display')).toHaveTextContent('25:00');
    
    // Start the timer
    const startStopButton = screen.getByTestId('start-stop-button');
    fireEvent.click(startStopButton);
    
    // Button should now show "Pause"
    expect(startStopButton).toHaveTextContent('Pause');
    
    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Timer should now show 24:50
    expect(screen.getByTestId('timer-display')).toHaveTextContent('24:50');
    
    // Pause the timer
    fireEvent.click(startStopButton);
    
    // Button should now show "Start"
    expect(startStopButton).toHaveTextContent('Start');
    
    // Advance timer more but it should be paused
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Timer should still show 24:50
    expect(screen.getByTestId('timer-display')).toHaveTextContent('24:50');
  });
  
  it('resets the timer', () => {
    render(<PomodoroComponent />);
    
    // Start the timer
    fireEvent.click(screen.getByTestId('start-stop-button'));
    
    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Timer should now show 24:50
    expect(screen.getByTestId('timer-display')).toHaveTextContent('24:50');
    
    // Reset the timer
    fireEvent.click(screen.getByTestId('reset-button'));
    
    // Timer should be reset to 25:00
    expect(screen.getByTestId('timer-display')).toHaveTextContent('25:00');
    
    // Timer should be paused
    expect(screen.getByTestId('start-stop-button')).toHaveTextContent('Start');
  });
  
  it('changes timer modes', () => {
    render(<PomodoroComponent />);
    
    // Initial mode should be focus with 25:00
    expect(screen.getByTestId('timer-display')).toHaveTextContent('25:00');
    
    // Switch to short break
    fireEvent.click(screen.getByTestId('short-break-button'));
    
    // Timer should now show 05:00 for short break
    expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00');
    
    // Switch to long break
    fireEvent.click(screen.getByTestId('long-break-button'));
    
    // Timer should now show 15:00 for long break
    expect(screen.getByTestId('timer-display')).toHaveTextContent('15:00');
    
    // Switch back to focus
    fireEvent.click(screen.getByTestId('focus-mode-button'));
    
    // Timer should now show 25:00 for focus
    expect(screen.getByTestId('timer-display')).toHaveTextContent('25:00');
  });
  
  it('completes a pomodoro cycle and transitions to break', () => {
    render(<PomodoroComponent />);
    
    // Start the timer
    fireEvent.click(screen.getByTestId('start-stop-button'));
    
    // Advance timer to completion
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000); // 25 minutes
    });
    
    // Should now be in short break mode
    expect(screen.getByTestId('short-break-button').className).toContain('active');
    
    // Timer should now show 05:00 for short break
    expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00');
    
    // Cycles counter should increment
    expect(screen.getByTestId('cycles-count')).toHaveTextContent('Pomodoros completed: 1');
  });
}); 