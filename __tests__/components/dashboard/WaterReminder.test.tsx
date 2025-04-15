import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WaterReminder } from '@/components/dashboard/WaterReminder';
import { toast } from 'sonner';

// Mock the Progress component to avoid indicatorClassName error
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}));

// Mock the sonner toast
jest.mock('sonner', () => {
  const mockToast = jest.fn() as jest.Mock & {
    success: jest.Mock;
    info: jest.Mock;
    warning: jest.Mock;
    error: jest.Mock;
  };
  
  mockToast.success = jest.fn();
  mockToast.info = jest.fn();
  mockToast.warning = jest.fn();
  mockToast.error = jest.fn();
  
  return {
    toast: mockToast,
  };
});

// Mock the Notification API
class MockNotification {
  static permission = 'granted';
  static requestPermission = jest.fn().mockResolvedValue('granted');
  
  constructor(public title: string, public options?: NotificationOptions) {
    // Constructor implementation
  }
  
  addEventListener = jest.fn();
  close = jest.fn();
}

Object.defineProperty(window, 'Notification', {
  value: MockNotification,
  writable: true
});

describe('WaterReminder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default values', () => {
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Check basic elements
    expect(screen.getByText('Water Reminder')).toBeInTheDocument();
    
    // Check for progress bar
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    
    // Check for reminder interval text
    expect(screen.getByText('Reminder every 60 minutes')).toBeInTheDocument();
    
    // Check for "until next reminder" text
    expect(screen.getByText('until next reminder')).toBeInTheDocument();
  });

  it('toggles reminder when bell button is clicked', () => {
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Find and click the bell button
    const buttons = screen.getAllByRole('button');
    const bellButton = buttons.find(button => 
      button.innerHTML.includes('lucide-bell')
    );
    
    if (!bellButton) {
      throw new Error('Bell button not found');
    }
    
    fireEvent.click(bellButton);
    
    // Should show a toast about reminders being activated
    expect(toast.success).toHaveBeenCalledWith("Water reminders activated", expect.anything());
    
    // Click again to deactivate
    fireEvent.click(bellButton);
    
    // Should show a toast about reminders being paused
    expect(toast.info).toHaveBeenCalledWith("Water reminders paused", expect.anything());
  });

  it('updates the reminder interval when interval buttons are clicked', () => {
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Find and click the 30-minute interval button
    const intervalButtons = screen.getAllByRole('button');
    const thirtyMinButton = intervalButtons.find(button => 
      button.textContent?.includes('30min')
    );
    
    if (!thirtyMinButton) {
      throw new Error('30-minute button not found');
    }
    
    fireEvent.click(thirtyMinButton);
    
    // Should update the text and show toast
    expect(screen.getByText('Reminder every 30 minutes')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Reminder interval set to 30 minutes", expect.anything());
  });
  
  it('resets timer when reset button is clicked', () => {
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Advance time a bit
    act(() => {
      jest.advanceTimersByTime(10 * 60 * 1000); // 10 minutes
    });
    
    // Find and click the reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Should show toast
    expect(toast.info).toHaveBeenCalledWith("Timer reset", expect.anything());
  });
  
  it('loads saved settings from localStorage', () => {
    // Setup localStorage with custom settings
    localStorage.setItem('waterReminder-test-user', JSON.stringify({
      lastReminderTime: new Date().toISOString(),
      reminderInterval: 45,
      isReminderActive: false,
      date: new Date().toDateString()
    }));
    
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Should have correct interval shown
    expect(screen.getByText('Reminder every 45 minutes')).toBeInTheDocument();
    
    // Should show "Paused" since reminder is inactive
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });
  
  it('sends a notification when the timer reaches zero', () => {
    const mockNotification = jest.fn();
    (window as any).Notification = jest.fn((...args) => {
      mockNotification(...args);
      return {
        addEventListener: jest.fn(),
        close: jest.fn()
      };
    });
    (window as any).Notification.permission = 'granted';
    (window as any).Notification.requestPermission = jest.fn().mockResolvedValue('granted');
    
    // Setup localStorage
    localStorage.setItem('waterReminder-test-user', JSON.stringify({
      lastReminderTime: new Date().toISOString(),
      reminderInterval: 1, // 1 minute for faster test
      isReminderActive: true,
      date: new Date().toDateString()
    }));
    
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Mock timeUntilNextReminder to be just 1 second
    act(() => {
      jest.advanceTimersByTime(59 * 1000); // 59 seconds
    });
    
    // Make the timer reach zero by advancing time
    act(() => {
      jest.advanceTimersByTime(2 * 1000); // 2 more seconds
    });
    
    // Should send a notification
    expect(mockNotification).toHaveBeenCalledWith(
      'Time to drink water! 💧',
      expect.anything()
    );
    
    // Toast should also be shown
    expect(toast).toHaveBeenCalledWith(
      "Time to drink water! 💧", 
      expect.objectContaining({
        description: expect.stringContaining("Stay hydrated")
      })
    );
  });

  it('shows different timer states based on activity', () => {
    render(<WaterReminder userId="test-user" />);
    
    // Let isClient initialize
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Initially shows the time
    const timeDisplay = screen.getByText((content) => {
      // Should match format MM:SS (60:00)
      return /\d{2}:\d{2}/.test(content);
    });
    expect(timeDisplay).toBeInTheDocument();
    
    // Toggle reminder off
    const bellButton = screen.getAllByRole('button').find(button => 
      button.innerHTML.includes('lucide-bell')
    );
    
    if (!bellButton) {
      throw new Error('Bell button not found');
    }
    
    fireEvent.click(bellButton);
    
    // Should now show "Paused"
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });
}); 