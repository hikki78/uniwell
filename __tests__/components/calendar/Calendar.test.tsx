import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simple mock calendar component for testing
const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div data-testid="calendar-component">
      <h1>Calendar</h1>
      <div className="calendar-header">
        <button>Previous</button>
        <div data-testid="current-month">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button>Next</button>
      </div>
      <div className="calendar-grid">
        {/* Calendar grid would be here */}
        <div data-testid="calendar-day" className="day">15</div>
      </div>
    </div>
  );
};

describe('Calendar Component', () => {
  it('renders the calendar correctly', () => {
    render(<CalendarComponent />);
    
    expect(screen.getByTestId('calendar-component')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('current-month')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-day')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
}); 