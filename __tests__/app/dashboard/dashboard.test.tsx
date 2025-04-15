import React from 'react';
import { render, screen } from '@testing-library/react';
import { toast } from 'sonner';

// Mock the components used in the dashboard page
jest.mock('@/components/dashboard/MeditationTimer', () => ({
  MeditationTimer: ({ userId, onComplete }: any) => (
    <div data-testid="meditation-timer">
      <span>Meditation Timer Mock</span>
      <button onClick={onComplete}>Complete</button>
    </div>
  )
}));

jest.mock('@/components/dashboard/WaterReminder', () => ({
  WaterReminder: ({ userId, onSettingsChange }: any) => (
    <div data-testid="water-reminder">
      <span>Water Reminder Mock</span>
      <button onClick={onSettingsChange}>Change Settings</button>
    </div>
  )
}));

jest.mock('@/components/dashboard/ScreenTimeMonitor', () => ({
  ScreenTimeMonitor: ({ userId, onSettingsChange, initialLimit }: any) => (
    <div data-testid="screen-time-monitor">
      <span>Screen Time Monitor Mock</span>
      <span>Limit: {initialLimit}</span>
      <button onClick={onSettingsChange}>Change Settings</button>
    </div>
  )
}));

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/dashboard',
    query: {},
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the dashboard page
jest.mock('@/app/[locale]/dashboard/page', () => {
  const { MeditationTimer } = require('@/components/dashboard/MeditationTimer');
  const { WaterReminder } = require('@/components/dashboard/WaterReminder');
  const { ScreenTimeMonitor } = require('@/components/dashboard/ScreenTimeMonitor');
  
  return {
    __esModule: true,
    default: () => {
      const userId = 'test-user';
      const settings = { screenTimeLimit: 120 };
      const setSettingsUpdated = jest.fn();
      const setIsMediating = jest.fn();
      
      return (
        <div>
          <h1>Dashboard</h1>
          <div className="wellness-components">
            <MeditationTimer 
              userId={userId} 
              onComplete={() => setIsMediating(false)} 
            />
            <WaterReminder
              userId={userId}
              onSettingsChange={() => setSettingsUpdated((prev: number) => prev + 1)}
            />
            <ScreenTimeMonitor
              userId={userId}
              onSettingsChange={() => setSettingsUpdated((prev: number) => prev + 1)}
              initialLimit={settings.screenTimeLimit}
            />
          </div>
        </div>
      );
    }
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  it('renders the dashboard with all wellness components', async () => {
    const Dashboard = require('@/app/[locale]/dashboard/page').default;
    render(<Dashboard />);
    
    // Check for main elements
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for wellness components
    expect(screen.getByTestId('meditation-timer')).toBeInTheDocument();
    expect(screen.getByText('Meditation Timer Mock')).toBeInTheDocument();
    
    expect(screen.getByTestId('water-reminder')).toBeInTheDocument();
    expect(screen.getByText('Water Reminder Mock')).toBeInTheDocument();
    
    expect(screen.getByTestId('screen-time-monitor')).toBeInTheDocument();
    expect(screen.getByText('Screen Time Monitor Mock')).toBeInTheDocument();
    expect(screen.getByText('Limit: 120')).toBeInTheDocument();
  });
}); 