import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the invite function to simulate API calls
const mockInviteUser = jest.fn().mockImplementation((email) => {
  return Promise.resolve({ success: true, message: `Invitation sent to ${email}` });
});

// Create a simple mock invite users component for testing
const InviteUsersComponent = () => {
  const [emails, setEmails] = React.useState('');
  const [inviting, setInviting] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim() || inviting) return;
    
    // Basic email validation
    const emailList = emails.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(', ')}`);
      return;
    }
    
    setInviting(true);
    setError('');
    
    try {
      const inviteResults = await Promise.all(
        emailList.map(async (email) => {
          const result = await mockInviteUser(email);
          return { email, ...result };
        })
      );
      
      setResults(inviteResults);
      setEmails('');
    } catch (err) {
      setError('Failed to send invitations. Please try again.');
    } finally {
      setInviting(false);
    }
  };
  
  return (
    <div data-testid="invite-users-component">
      <h1>Invite Users</h1>
      
      <form onSubmit={handleInvite} className="invite-form">
        <div className="form-group">
          <label htmlFor="emails">Email Addresses</label>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses, separated by commas"
            disabled={inviting}
            data-testid="emails-input"
            rows={3}
            className="form-control"
          />
          <small className="form-text text-muted">
            Enter multiple email addresses separated by commas
          </small>
        </div>
        
        {error && (
          <div className="alert alert-danger" data-testid="error-message">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={inviting || !emails.trim()}
          data-testid="invite-button"
          className="btn btn-primary"
        >
          {inviting ? 'Sending Invitations...' : 'Send Invitations'}
        </button>
      </form>
      
      {results.length > 0 && (
        <div className="invite-results" data-testid="invite-results">
          <h2>Invitation Results</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index} data-testid={`result-${index}`}>
                {result.email}: {result.success ? 'Sent' : 'Failed'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

describe('InviteUsers Component', () => {
  beforeEach(() => {
    mockInviteUser.mockClear();
  });

  it('renders the invite users component correctly', () => {
    render(<InviteUsersComponent />);
    
    expect(screen.getByTestId('invite-users-component')).toBeInTheDocument();
    expect(screen.getByText('Invite Users')).toBeInTheDocument();
    expect(screen.getByTestId('emails-input')).toBeInTheDocument();
    expect(screen.getByTestId('invite-button')).toBeInTheDocument();
    expect(screen.getByTestId('invite-button')).toBeDisabled();
  });
  
  it('validates email addresses', () => {
    render(<InviteUsersComponent />);
    
    const input = screen.getByTestId('emails-input');
    const submitButton = screen.getByTestId('invite-button');
    
    // Enter invalid email
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email');
    
    // Clear and enter valid email
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(submitButton).not.toBeDisabled();
    
    // Enter multiple emails with one invalid
    fireEvent.change(input, { target: { value: 'test@example.com, invalid-email, another@example.com' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email');
  });
  
  it('sends invitations and displays results', async () => {
    render(<InviteUsersComponent />);
    
    const input = screen.getByTestId('emails-input');
    const submitButton = screen.getByTestId('invite-button');
    
    // Enter valid emails
    fireEvent.change(input, { target: { value: 'test1@example.com, test2@example.com' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during invitation process
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Sending Invitations');
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByTestId('invite-results')).toBeInTheDocument();
    });
    
    // Check if the API was called for both emails
    expect(mockInviteUser).toHaveBeenCalledTimes(2);
    expect(mockInviteUser).toHaveBeenCalledWith('test1@example.com');
    expect(mockInviteUser).toHaveBeenCalledWith('test2@example.com');
    
    // Check if results are displayed
    expect(screen.getByText(/test1@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/test2@example.com/)).toBeInTheDocument();
    
    // Input should be cleared after successful invitations
    expect(input).toHaveValue('');
  });
}); 