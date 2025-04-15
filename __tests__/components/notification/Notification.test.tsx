import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simple mock notification component for testing
const NotificationComponent = () => {
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'Meditation reminder', message: 'Time for your daily meditation!', read: false, timestamp: new Date() },
    { id: 2, title: 'Water intake', message: 'Remember to stay hydrated!', read: true, timestamp: new Date(Date.now() - 3600000) }
  ]);
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };
  
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };
  
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  return (
    <div data-testid="notification-component">
      <h1>Notifications</h1>
      
      <div className="notification-header">
        <div className="notification-count" data-testid="notification-count">
          {unreadCount} unread
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => setNotifications(notifications.map(notif => ({ ...notif, read: true })))}
            data-testid="mark-all-read"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notification-list" data-testid="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification ${notification.read ? 'read' : 'unread'}`}
              data-testid={`notification-${notification.id}`}
            >
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    data-testid={`mark-read-${notification.id}`}
                  >
                    Mark as read
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  data-testid={`delete-${notification.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

describe('Notification Component', () => {
  it('renders the notification component correctly', () => {
    render(<NotificationComponent />);
    
    expect(screen.getByTestId('notification-component')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByTestId('notification-count')).toBeInTheDocument();
    expect(screen.getByText('1 unread')).toBeInTheDocument();
    expect(screen.getByTestId('notification-list')).toBeInTheDocument();
    expect(screen.getByText('Meditation reminder')).toBeInTheDocument();
    expect(screen.getByText('Water intake')).toBeInTheDocument();
  });
  
  it('marks a notification as read when button is clicked', () => {
    render(<NotificationComponent />);
    
    // Initially has 1 unread notification
    expect(screen.getByText('1 unread')).toBeInTheDocument();
    
    // Find and click the "Mark as read" button for the unread notification
    const markReadButton = screen.getByTestId('mark-read-1');
    fireEvent.click(markReadButton);
    
    // Should now have 0 unread notifications
    expect(screen.getByText('0 unread')).toBeInTheDocument();
    
    // "Mark as read" button should no longer be present
    expect(screen.queryByTestId('mark-read-1')).not.toBeInTheDocument();
  });
  
  it('deletes a notification when delete button is clicked', () => {
    render(<NotificationComponent />);
    
    // Find and click the delete button for a notification
    const deleteButton = screen.getByTestId('delete-2');
    fireEvent.click(deleteButton);
    
    // The notification should be removed
    expect(screen.queryByText('Water intake')).not.toBeInTheDocument();
    
    // Should still have the other notification
    expect(screen.getByText('Meditation reminder')).toBeInTheDocument();
  });
}); 