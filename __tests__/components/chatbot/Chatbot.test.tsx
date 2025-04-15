import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the response function to simulate API calls
const mockResponse = jest.fn().mockImplementation((message) => {
  return Promise.resolve({
    text: `Response to: ${message}`,
    timestamp: new Date()
  });
});

// Create a simple mock chatbot component for testing
const ChatbotComponent = () => {
  const [messages, setMessages] = React.useState([
    { id: 1, role: 'system', content: 'Welcome to UniWell! How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await mockResponse(input.trim());
      
      const botMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.text,
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div data-testid="chatbot-component">
      <h1>Wellness Assistant</h1>
      <div className="chat-messages" data-testid="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`} data-testid={`message-${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message loading" data-testid="loading-indicator">Thinking...</div>}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about wellness..."
          data-testid="message-input"
          disabled={isLoading}
        />
        <button type="submit" data-testid="send-button" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

describe('Chatbot Component', () => {
  beforeEach(() => {
    mockResponse.mockClear();
  });

  it('renders the chatbot interface correctly', () => {
    render(<ChatbotComponent />);
    
    expect(screen.getByTestId('chatbot-component')).toBeInTheDocument();
    expect(screen.getByText('Wellness Assistant')).toBeInTheDocument();
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    expect(screen.getByTestId('message-system')).toBeInTheDocument();
    expect(screen.getByText('Welcome to UniWell! How can I help you today?')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });
  
  it('sends a message and receives a response', async () => {
    render(<ChatbotComponent />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'How can I improve my sleep?' } });
    fireEvent.click(sendButton);
    
    // Check if user message is displayed
    expect(screen.getByText('How can I improve my sleep?')).toBeInTheDocument();
    
    // Check if loading indicator appears
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText('Response to: How can I improve my sleep?')).toBeInTheDocument();
    });
    
    // Check if the API was called with the correct message
    expect(mockResponse).toHaveBeenCalledWith('How can I improve my sleep?');
  });
}); 