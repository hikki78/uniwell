import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScreenTimeMonitor } from '@/components/dashboard/ScreenTimeMonitor';
import { toast } from 'sonner';

// Mock the Progress component to avoid indicatorClassName error
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number, className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}));

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ScreenTimeMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default values', () => {
    const onSettingsChange = jest.fn();
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Check for main elements
    expect(screen.getByText('Screen Time')).toBeInTheDocument();
    // Check time display which might be split into multiple elements
    expect(screen.getByText('0m')).toBeInTheDocument();
    // Use getAllByText instead of getByText for elements that appear multiple times
    const timeElements = screen.getAllByText(/2h 0m/);
    expect(timeElements.length).toBeGreaterThan(0);
    // Check for progress bar instead of percentage
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('renders with custom initial limit', () => {
    const onSettingsChange = jest.fn();
    render(
      <ScreenTimeMonitor 
        userId="test-user" 
        onSettingsChange={onSettingsChange} 
        initialLimit={180} 
      />
    );
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Check for custom limit (180 minutes = 3h 0m) with getAllByText
    const limitElements = screen.getAllByText(/3h 0m/);
    expect(limitElements.length).toBeGreaterThan(0);
  });

  it('toggles tracking when tracking button is clicked', () => {
    const onSettingsChange = jest.fn();
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find and click the tracking toggle button
    const toggleButton = screen.getByRole('button', { name: /Start Tracking/i });
    fireEvent.click(toggleButton);

    // Should now show "Pause" button
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledWith("Screen time tracking started");

    // Click again to pause
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    
    // Should now show "Start Tracking" button again
    expect(screen.getByRole('button', { name: /Start Tracking/i })).toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledWith("Screen time tracking paused");
  });

  it('increments screen time while tracking is active', () => {
    const onSettingsChange = jest.fn();
    
    // Mock user activity events
    const originalAddEventListener = window.addEventListener;
    const events: Record<string, Function> = {};
    
    window.addEventListener = jest.fn().mockImplementation((event, cb) => {
      events[event] = cb;
    });
    
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Start tracking
    const toggleButton = screen.getByRole('button', { name: /Start Tracking/i });
    fireEvent.click(toggleButton);
    
    // Simulate user activity by triggering mousedown event
    act(() => {
      if (events.mousedown) {
        events.mousedown();
      }
    });
    
    // Advance time by 10 seconds (interval for tracking)
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Should have some screen time now (approximately 0.17 minutes or 10 seconds)
    // Since the component rounds and formats the time, it might still show as "0m"
    // To test this properly, we'd need to advance enough time to see a change
    
    // Advance by another 50 seconds (total 1 minute)
    act(() => {
      jest.advanceTimersByTime(50000);
    });
    
    // Now it should show some time used
    expect(screen.queryByText('0m')).not.toBeInTheDocument();
    
    // Restore original addEventListener
    window.addEventListener = originalAddEventListener;
  });

  it('resets screen time counter when reset button is clicked', () => {
    const onSettingsChange = jest.fn();
    
    // Setup localStorage with some existing screen time
    localStorage.setItem(`screenTimeData-test-user`, JSON.stringify({
      timeUsed: 30, // 30 minutes
      isTracking: false,
      date: new Date().toDateString()
    }));
    
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Should show 30 minutes of screen time
    expect(screen.getByText('30m')).toBeInTheDocument();
    
    // Find and click the reset button
    const resetButton = screen.getByText('Reset Counter');
    fireEvent.click(resetButton);
    
    // Screen time should be reset to 0
    expect(screen.getByText('0m')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Screen time counter reset");
  });

  it('updates screen time limit when slider is adjusted', () => {
    const onSettingsChange = jest.fn();
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Find the settings icon by its SVG content
    const settingsIcon = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.innerHTML.includes('lucide-settings');
    });
    
    fireEvent.click(settingsIcon);
    
    // Find the limit slider specifically (can use a more specific selector)
    const sliders = screen.getAllByRole('slider');
    const limitSlider = sliders.find(slider => 
      slider.getAttribute('max') === '720'
    );
    
    if (!limitSlider) {
      throw new Error('Limit slider not found');
    }
    
    fireEvent.change(limitSlider, { target: { value: 180 } });
    
    // Save settings by finding and clicking the save button if it exists
    const saveButton = screen.getByText('Save Settings');
    if (saveButton) {
      fireEvent.click(saveButton);
    }
    
    // Check if limit is updated in storage
    expect(localStorage.getItem(`screenTimeLimit-test-user`)).toBe('180');
    
    // Check if callback was called
    expect(onSettingsChange).toHaveBeenCalled();
  });

  it('shows warning toast when screen time exceeds notification threshold', () => {
    const onSettingsChange = jest.fn();
    
    // Setup localStorage with screen time close to the limit
    localStorage.setItem(`screenTimeData-test-user`, JSON.stringify({
      timeUsed: 100, // 100 minutes (over 80% of default 120 minute limit)
      isTracking: true,
      date: new Date().toDateString()
    }));
    
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update and useEffects
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Warning toast should be shown
    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("You've used"),
      expect.anything()
    );
  });

  it('shows error toast when screen time exceeds the limit', () => {
    const onSettingsChange = jest.fn();
    
    // Setup localStorage with screen time exceeding the limit
    localStorage.setItem(`screenTimeData-test-user`, JSON.stringify({
      timeUsed: 130, // 130 minutes (over the default 120 minute limit)
      isTracking: true,
      date: new Date().toDateString()
    }));
    
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update and useEffects
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Error toast should be shown
    expect(toast.error).toHaveBeenCalledWith(
      "Screen time limit reached! Consider taking a break.",
      expect.anything()
    );
  });

  it('loads saved settings from localStorage', () => {
    const onSettingsChange = jest.fn();
    
    // Setup localStorage with custom settings
    localStorage.setItem(`screenTimeLimit-test-user`, '240'); // 4 hours
    localStorage.setItem(`screenTimeData-test-user`, JSON.stringify({
      timeUsed: 60, // 1 hour
      isTracking: true, // Tracking is on
      date: new Date().toDateString()
    }));
    
    render(<ScreenTimeMonitor userId="test-user" onSettingsChange={onSettingsChange} />);
    
    // Use act to trigger the isClient state update
    act(() => {
      jest.advanceTimersByTime(10);
    });
    
    // Should show the saved limit and time
    expect(screen.getByText(/1h 0m/)).toBeInTheDocument();
    
    // Check for the limit (4h) using a more flexible approach
    const limitElements = screen.getAllByText(/4h 0m/);
    expect(limitElements.length).toBeGreaterThan(0);
    
    // Should show that tracking is active
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
  });
}); 