"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageSquare, X, Send, Loader2, Sparkles, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LOCAL_STORAGE_KEY = 'claude-assistant-chat-history';

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);
  
  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get current page context
  const getCurrentPageContext = () => {
    // Extract the main section from the path
    const pathSegments = pathname.split('/');
    const mainSection = pathSegments.length > 2 ? pathSegments[2] : 'dashboard';
    
    return `Currently on: ${mainSection} page`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call API endpoint with current page context
      const response = await axios.post('/api/ai/chat', { 
        message: userMessage,
        context: getCurrentPageContext()
      });
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      
      // If using fallback mode, notify the user
      if (response.data.usedFallback) {
        toast.info('Using fallback mode - AI service is currently unavailable', {
          duration: 5000,
          position: 'bottom-center'
        });
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      // Extract error message from the response if available
      const errorMessage = error.response?.data?.error || 'Failed to get response from AI';
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again later.` 
      }]);
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    toast.success('Chat history cleared');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-lg"
        variant="default"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <Card className="w-80 md:w-96 shadow-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-medium">Claude AI Assistant</h3>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80 mr-1"
                    title="Clear chat history"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-3 overflow-y-auto max-h-[350px] bg-secondary/30">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Ask me anything about productivity, wellness, or study habits!</p>
                    <p className="text-xs mt-2 text-muted-foreground">Powered by Claude AI</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Input */}
              <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
