import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Create a simple mock chat component for testing
const ChatComponent = () => {
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'User', text: 'Hello!', timestamp: new Date() },
    { id: 2, sender: 'Bot', text: 'Hi there!', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = React.useState('');
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { 
        id: messages.length + 1, 
        sender: 'User', 
        text: newMessage,
        timestamp: new Date()
      }]);
      setNewMessage('');
    }
  };
  
  return (
    <div data-testid="chat-component">
      <h1>Chat</h1>
      <div className="chat-messages" data-testid="message-list">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender.toLowerCase()}`}>
            <div className="message-sender">{msg.sender}</div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          data-testid="message-input"
        />
        <button type="submit" data-testid="send-button">Send</button>
      </form>
    </div>
  );
};

describe('Chat Component', () => {
  it('renders the chat interface correctly', () => {
    render(<ChatComponent />);
    
    expect(screen.getByTestId('chat-component')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });
  
  it('allows sending a new message', () => {
    render(<ChatComponent />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'A new message' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('A new message')).toBeInTheDocument();
  });
}); 